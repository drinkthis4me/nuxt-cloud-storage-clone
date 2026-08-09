import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { fileIdSchema, fileStatus } from '#shared/schemas/file'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import type { DownloadUrlResponse } from '#shared/types/response/files'

export default defineEventHandler(async (event): Promise<DownloadUrlResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
  let file

  try {
    file = await prismaClient.file.findUnique({
      where: { id: fileId },
      include: {
        shares: { where: { userId: user.id } },
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  const isOwner = file.ownerId === user.id
  const hasShareAccess = file.shares.length > 0 // VIEW or EDIT — either can read

  if (!isOwner && !hasShareAccess) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  if (file.isFolder) {
    throw createError({ ...HTTP_STATUS.BAD_REQUEST, message: 'Cannot download a folder' })
  }

  if (file.status !== fileStatus.UPLOADED) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'File upload is not complete' })
  }

  const config = useRuntimeConfig()

  let downloadUrl: string
  try {
    const s3 = useS3Client()
    const command = new GetObjectCommand({
      Bucket: config.minio.bucket,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
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
