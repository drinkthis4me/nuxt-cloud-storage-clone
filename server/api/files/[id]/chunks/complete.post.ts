import { CompleteMultipartUploadCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { usePrismaClient } from '#server/utils/prisma'
import { useS3Client } from '#server/utils/s3'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileIdSchema, fileStatus } from '~~/shared/schemas/file'
import type { FinalizeChunkedUploadResponse } from '~~/shared/types/response/chunks'

export default defineEventHandler(async (event): Promise<FinalizeChunkedUploadResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
  const config = useRuntimeConfig()

  let file

  try {
    file = await prismaClient.file.findUnique({
      where: { id: fileId },
      include: { fileChunks: { orderBy: { partNumber: 'asc' } } },
    })
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

  if (file.status === fileStatus.UPLOADED) {
    return { file: serializeFile(file) } // idempotent
  }

  const incomplete = file.fileChunks.filter(c => c.status !== 'UPLOADED' || !c.etag)
  if (incomplete.length > 0) {
    throw createError({
      ...HTTP_STATUS.CONFLICT,
      message: `${incomplete.length} chunk(s) have not finished uploading`,
    })
  }

  const s3 = useS3Client()

  try {
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: config.minio.bucket,
        Key: file.storageKey,
        UploadId: file.uploadId,
        MultipartUpload: {
          Parts: file.fileChunks.map(c => ({
            PartNumber: c.partNumber,
            ETag: c.etag!,
          })),
        },
      }),
    )
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({
      ...HTTP_STATUS.UNPROCESSABLE_CONTENT,
      message: 'Failed to finalize upload — parts may not match',
    })
  }

  try {
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: config.minio.bucket,
        Key: file.storageKey,
      }),
    )
    if (Number(head.ContentLength) !== Number(file.size)) {
      throw createError({
        ...HTTP_STATUS.UNPROCESSABLE_CONTENT,
        message: `Size mismatch: expected ${file.size}, got ${head.ContentLength}`,
      })
    }
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Failed to verify uploaded file' })
  }

  let updated
  try {
    updated = await prismaClient.file.update({
      where: { id: file.id },
      data: { status: fileStatus.UPLOADED },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { file: serializeFile(updated) }
})
