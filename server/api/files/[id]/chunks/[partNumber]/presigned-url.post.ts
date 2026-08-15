import { z } from 'zod'
import { UploadPartCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema } from '~~/shared/schemas/file'
import type { ChunkPresignedUrlResponse } from '~~/shared/types/response/chunks'

const paramsSchema = fileIdSchema.extend({
  partNumber: z.coerce.number().int().positive(),
})

export default defineEventHandler(async (event): Promise<ChunkPresignedUrlResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId, partNumber } = await validateRequest(event, getValidatedRouterParams, paramsSchema)

  const prismaClient = usePrismaClient()
  const config = useRuntimeConfig()

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

  if (!file.uploadId) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'Upload has not been initiated' })
  }

  let chunk
  try {
    chunk = await prismaClient.fileChunk.findUnique({
      where: {
        fileId_partNumber: {
          fileId: file.id,
          partNumber,
        },
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!chunk) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Chunk not found for this upload' })
  }

  let uploadUrl: string
  try {
    const s3 = useS3Client()
    const command = new UploadPartCommand({
      Bucket: config.minio.bucket,
      Key: file.storageKey,
      UploadId: file.uploadId,
      PartNumber: partNumber,
    })
    uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    uploadUrl,
    partNumber,
  }
})
