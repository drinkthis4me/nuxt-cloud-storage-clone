import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { validateShareLink } from '#server/utils/shareLink'
import { fileStatus } from '~~/shared/schemas/file'
import { shareLinkTokenSchema, downloadQuerySchema } from '~~/shared/schemas/shareLink'

import type { PrismaClient, File } from '~~/prisma/generated/client'
import type { DownloadUrlResponse } from '~~/shared/types/response/files'

const MAX_DEPTH = 50

export default defineEventHandler(async (event): Promise<DownloadUrlResponse> => {
  const { token } = await validateRequest(event, getValidatedRouterParams, shareLinkTokenSchema)
  const { fileId } = await validateRequest(event, getValidatedQuery, downloadQuerySchema)
  const prismaClient = usePrismaClient()
  const config = useRuntimeConfig()

  const link = await validateShareLink(event, token, prismaClient)

  let targetFile: File

  if (!fileId || fileId === link.file.id) {
    targetFile = link.file
  }
  else {
    if (!link.file.isFolder) {
      throw createError({
        ...HTTP_STATUS.BAD_REQUEST,
        message: 'This link does not point to a folder',
      })
    }

    const found = await loadFileIfWithinTree(fileId, link.file.id, prismaClient)
    if (!found) {
      throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
    }
    targetFile = found
  }

  if (targetFile.isFolder) {
    throw createError({
      ...HTTP_STATUS.BAD_REQUEST,
      message: 'Cannot download a folder',
    })
  }

  if (targetFile.status !== fileStatus.UPLOADED) {
    throw createError({
      ...HTTP_STATUS.CONFLICT,
      message: 'File is not available for download',
    })
  }

  let downloadUrl: string
  try {
    const s3 = useS3Client()
    const command = new GetObjectCommand({
      Bucket: config.minio.bucket,
      Key: targetFile.storageKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(targetFile.name)}"`,
    })
    downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    downloadUrl,
    expiresIn: 300,
  }
})

// Walks up from the target file toward the link's root, confirming rootId appears in the ancestor chain
async function loadFileIfWithinTree(
  targetId: string,
  rootId: string,
  prismaClient: PrismaClient,
): Promise<File | null> {
  let target: File | null
  try {
    target = await prismaClient.file.findUnique({
      where: { id: targetId },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!target || target.status === fileStatus.DELETED) return null

  let currentId: string | null = target.parentFolderId
  let depth = 0

  while (currentId) {
    if (depth++ > MAX_DEPTH) {
      throw createError({
        ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Folder chain too deep',
      })
    }
    if (currentId === rootId) return target

    let parent
    try {
      parent = await prismaClient.file.findUnique({
        where: { id: currentId },
        select: { parentFolderId: true },
      })
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }
    currentId = parent?.parentFolderId ?? null
  }

  return null
}
