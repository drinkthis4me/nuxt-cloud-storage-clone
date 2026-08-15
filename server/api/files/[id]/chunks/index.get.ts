import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema, fileStatus } from '~~/shared/schemas/file'

import type { ChunkStatusResponse } from '~~/shared/types/response/chunks'

export default defineEventHandler(async (event): Promise<ChunkStatusResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
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

  if (file.status !== fileStatus.UPLOADING || !file.uploadId) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'File is not an in-progress chunked upload' })
  }

  return {
    uploadId: file.uploadId,
    chunks: file.fileChunks.map(c => ({ partNumber: c.partNumber, status: c.status })),
  }
})
