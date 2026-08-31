import { getStorageKey } from '#server/utils/getStorageKey'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { serializeFile } from '#server/utils/serializeFile'
import { validateRequest } from '#server/utils/validateRequest'
import { fileSchema, folderSchema } from '#shared/schemas/file'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'
import { fileStatus } from '~~/shared/schemas/file'
import { sharePermission } from '~~/shared/schemas/shareLink'
import { uploadStrategy } from '~~/shared/const/uploadStrategy'

import type {
  CreateFileResponse,
  CreateFileUploadResponse,
  CreateFolderResponse,
} from '~~/shared/types/response/files'
import type { FolderSchema, FileSchema } from '#shared/schemas/file'
import type { H3Event } from 'h3'
import type { PrismaClient } from '~~/prisma/generated/client'

const bodySchema = z.discriminatedUnion('isFolder', [folderSchema, fileSchema])

export default defineEventHandler(async (event): Promise<CreateFileResponse> => {
  const { user } = await requireUserSession(event)
  const body = await validateRequest(event, readValidatedBody, bodySchema)

  const prismaClient = usePrismaClient()

  if (body.parentFolderId) {
    await assertParentFolderIsValid(body.parentFolderId, user.id, prismaClient)
  }

  return body.isFolder
    ? createFolder(event, body, user.id, prismaClient)
    : createFileUpload(event, body, user.id, prismaClient)
})

/**
 * Shared validation: Check owner and edit permission.
 */
async function assertParentFolderIsValid(
  parentFolderId: string,
  userId: number,
  prismaClient: PrismaClient,
) {
  const parent = await prismaClient.file.findUnique({
    where: { id: parentFolderId },
    include: { shares: { where: { userId } } },
  })

  if (!parent || !parent.isFolder) {
    throw createError({
      ...HTTP_STATUS.NOT_FOUND,
      message: 'Parent folder not found',
    })
  }

  const isOwner = parent.ownerId === userId
  const hasEditAccess = parent.shares.some(s => s.permission === sharePermission.EDIT)

  if (!isOwner && !hasEditAccess) {
    throw createError({
      ...HTTP_STATUS.FORBIDDEN,
      message: 'No write access to this folder',
    })
  }
}

/**
 * Folder creation: synchronous, no storage step
 */
async function createFolder(
  event: H3Event,
  body: FolderSchema,
  userId: number,
  prismaClient: PrismaClient,
): Promise<CreateFolderResponse> {
  let folder
  try {
    folder = await prismaClient.file.create({
      data: {
        id: crypto.randomUUID(),
        ownerId: userId,
        name: body.name,
        isFolder: true,
        mimeType: 'application/x-directory',
        size: 0n,
        fingerprint: '',
        storageKey: '',
        status: fileStatus.UPLOADED,
        parentFolderId: body.parentFolderId ?? null,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  setResponseStatus(event, 201)
  return { file: serializeFile(folder) }
}

/**
 * File creation: pending row + presigned upload URL
 */
async function createFileUpload(
  event: H3Event,
  body: FileSchema,
  userId: number,
  prismaClient: PrismaClient,
): Promise<CreateFileUploadResponse> {
  const config = useRuntimeConfig(event)
  const appConfig = useAppConfig()

  // Dedup check: same user, same content already uploaded
  let existing
  try {
    existing = await prismaClient.file.findFirst({
      where: {
        ownerId: userId,
        fingerprint: body.fingerprint,
        status: fileStatus.UPLOADED,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (existing) {
    setResponseStatus(event, 200) // not a new resource — nothing was created
    return {
      duplicate: true,
      file: serializeFile(existing),
    }
  }

  const fileId = crypto.randomUUID()
  const storageKey = getStorageKey(userId, fileId)

  let file
  try {
    file = await prismaClient.file.create({
      data: {
        id: fileId,
        ownerId: userId,
        name: body.name,
        mimeType: body.mimeType || 'application/octet-stream',
        size: BigInt(body.size),
        fingerprint: body.fingerprint,
        storageKey,
        status: fileStatus.UPLOADING,
        parentFolderId: body.parentFolderId ?? null,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  const isChunked = Number(body.size) > appConfig.chunk.thresholdBytes
  if (isChunked) {
    // Client should call "POST /api/files/chunks/init" next
    setResponseStatus(event, 201)
    return {
      duplicate: false,
      file: serializeFile(file),
      uploadStrategy: uploadStrategy.CHUNKED,
    }
  }

  let uploadUrl: string
  try {
    const s3 = useS3Client()
    const command = new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: storageKey,
      ContentType: body.mimeType,
    })
    uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  setResponseStatus(event, 201)
  return {
    duplicate: false,
    file: serializeFile(file),
    uploadStrategy: uploadStrategy.SINGLE,
    uploadUrl,
  }
}
