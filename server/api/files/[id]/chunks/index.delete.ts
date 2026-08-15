import { AbortMultipartUploadCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema, fileStatus } from '~~/shared/schemas/file'

import type { CancelUploadResponse } from '~~/shared/types/response/chunks'

export default defineEventHandler(async (event): Promise<CancelUploadResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

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

  if (file.status !== fileStatus.UPLOADING) {
    throw createError({
      ...HTTP_STATUS.CONFLICT,
      message: 'Only an in-progress upload can be cancelled',
    })
  }

  // Abort the S3 session first — if this fails, don't delete our records yet,
  // since that would orphan uploaded parts in storage with nothing tracking them
  const s3 = useS3Client()
  if (file.uploadId) {
    try {
      await s3.send(new AbortMultipartUploadCommand({
        Bucket: config.minio.bucket,
        Key: file.storageKey,
        UploadId: file.uploadId,
      }))
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({
        ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Failed to abort upload in storage',
      })
    }
  }
  else {
    // Non-chunked file upload (single PUT). Act as hard delete.
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: config.minio.bucket,
        Key: file.storageKey,
      }))
    }
    catch (err: unknown) {
      // Best effort: Object may not have been uploaded yet.
      console.warn('Failed to clean up storage object on cancel (may not exit)', { cause: err })
    }
  }

  try {
    // FileChunk rows cascade via onDelete: Cascade
    await prismaClient.file.delete({ where: { id: file.id } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    id: file.id,
    cancelled: true,
  }
})
