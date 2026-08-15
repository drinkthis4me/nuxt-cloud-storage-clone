import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema, fileStatus } from '~~/shared/schemas/file'
import type { InitChunkedUploadResponse } from '~~/shared/types/response/chunks'

export default defineEventHandler(async (event): Promise<InitChunkedUploadResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
  const config = useRuntimeConfig()
  const appConfig = useAppConfig()

  let file

  try {
    file = await prismaClient.file.findUnique({ where: { id: fileId } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  if (file.isFolder) {
    throw createError({ ...HTTP_STATUS.BAD_REQUEST, message: 'Cannot upload content to a folder' })
  }

  if (file.status !== fileStatus.UPLOADING) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'File is not awaiting upload' })
  }

  const totalChunks = Math.ceil(Number(file.size) / appConfig.chunk.sizeBytes)

  if (file.uploadId) {
    // already initiated — idempotent, return the existing session rather than starting a second one
    return {
      uploadId: file.uploadId,
      chunkSize: appConfig.chunk.sizeBytes,
      totalChunks,
    }
  }

  let uploadId: string
  try {
    const s3 = useS3Client()
    const result = await s3.send(new CreateMultipartUploadCommand({
      Bucket: config.minio.bucket,
      Key: file.storageKey,
      ContentType: file.mimeType,
    }))
    if (!result.UploadId) throw new Error('MinIO did not return an UploadId')
    uploadId = result.UploadId
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Failed to start upload',
    })
  }

  try {
    await prismaClient.$transaction([
      prismaClient.file.update({ where: { id: file.id }, data: { uploadId } }),
      prismaClient.fileChunk.createMany({
        data: Array.from({ length: totalChunks }, (_, i) => ({
          id: crypto.randomUUID(),
          fileId: file.id,
          partNumber: i + 1, // S3 part numbers are 1-indexed
          status: 'PENDING' as const,
        })),
      }),
    ])
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    uploadId,
    chunkSize: appConfig.chunk.sizeBytes,
    totalChunks,
  }
})
