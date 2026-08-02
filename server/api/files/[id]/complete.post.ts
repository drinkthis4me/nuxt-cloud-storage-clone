import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { validateRequest } from '#server/utils/validateRequest'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { serializeFile } from '~~/server/utils/serializeFile'
import { fileIdSchema, fileStatus } from '~~/shared/schemas/file'

import type { File } from '~~/prisma/generated/client'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
  let file: File | null

  try {
    file = await prismaClient.file.findUnique({ where: { id: fileId } })
  }
  catch (err: unknown) {
    console.log(err)

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({
      ...HTTP_STATUS.NOT_FOUND,
      message: 'File not found',
    })
  }

  if (file.status === fileStatus.UPLOADED) {
    return { file: serializeFile(file) }
  }

  // Verify the object actually landed in MinIO — never trust the client alone
  const config = useRuntimeConfig()
  const s3 = useS3Client()
  const command = new HeadObjectCommand({
    Bucket: config.minio.bucket,
    Key: file.storageKey,
  })
  let head

  try {
    head = await s3.send(command)
  }
  catch (err: unknown) {
    console.log(err)

    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === HTTP_STATUS.UNPROCESSABLE_CONTENT.status) {
      throw createError({
        ...HTTP_STATUS.UNPROCESSABLE_CONTENT,
        message: 'Upload not found in storage',
      })
    }

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }

  if (Number(head.ContentLength) !== Number(file.size)) {
    throw createError({
      ...HTTP_STATUS.UNPROCESSABLE_CONTENT,
      message: `Size mismatch: expected ${file.size}, got ${head.ContentLength}`,
    })
  }

  try {
    const updated = await prismaClient.file.update({
      where: { id: file.id },
      data: { status: fileStatus.UPLOADED },
    })

    return { file: serializeFile(updated) }
  }
  catch (err: unknown) {
    console.log(err)

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }
})
