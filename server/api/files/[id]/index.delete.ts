import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { serializeFile } from '#server/utils/serializeFile'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { deleteFileSchema, fileIdSchema, fileStatus } from '~~/shared/schemas/file'

import type { NitroRuntimeConfig } from 'nitropack/types'
import type { PrismaClient, File } from '~~/prisma/generated/client'
import type { S3Client } from '@aws-sdk/client-s3'
import type {
  FileResponse,
  DeleteFileResponse,
  HardDeleteFileResponse,
} from '~~/shared/types/response/files'

export default defineEventHandler(async (event): Promise<DeleteFileResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
  const { permanent } = await validateRequest(event, getValidatedQuery, deleteFileSchema)

  const prismaClient = usePrismaClient()
  let file: File | null

  try {
    file = await prismaClient.file.findUnique({
      where: { id: fileId },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  if (file.isFolder) {
    await assertFolderIsEmpty(file.id, prismaClient)
  }

  if (permanent) {
    const s3 = useS3Client()
    const config = useRuntimeConfig(event)
    return hardDelete(file, prismaClient, s3, config)
  }

  if (file.status === fileStatus.DELETED) {
    return { file: serializeFile(file) } // already deleted, idempotent
  }

  return softDelete(file, prismaClient)
})

async function assertFolderIsEmpty(folderId: string, prismaClient: PrismaClient) {
  let childCount: number

  try {
    childCount = await prismaClient.file.count({
      where: { parentFolderId: folderId },
    })
  }
  catch (err) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (childCount > 0) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'Folder is not empty' })
  }
}

// Hard delete: removes the row, the S3 object, and any chunk records
async function hardDelete(
  file: File,
  prismaClient: PrismaClient,
  s3: S3Client,
  runtimeConfig: NitroRuntimeConfig,
): Promise<HardDeleteFileResponse> {
  if (file.status !== fileStatus.DELETED) {
    throw createError({
      ...HTTP_STATUS.CONFLICT,
      message: 'File must be soft-deleted before it can be permanently deleted',
    })
  }

  if (!file.isFolder && file.storageKey) {
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: runtimeConfig.minio.bucket,
        Key: file.storageKey,
      }))
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({
        ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete file from storage',
      })
    }
  }

  try {
    // FileChunk and Share rows cascade via "onDelete: Cascade"
    await prismaClient.file.delete({
      where: { id: file.id },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { id: file.id, deleted: true }
}

// Soft delete: Mark file status with 'DELETED'
async function softDelete(
  file: { id: string },
  prismaClient: PrismaClient,
): Promise<FileResponse> {
  let updated

  try {
    updated = await prismaClient.file.update({
      where: { id: file.id },
      data: {
        status: fileStatus.DELETED,
        deletedAt: new Date(),
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { file: serializeFile(updated) }
}
