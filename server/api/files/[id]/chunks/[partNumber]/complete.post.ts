// server/api/files/[id]/chunks/[partNumber]/complete.post.ts
import { z } from 'zod'
import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema } from '~~/shared/schemas/file'
import type { ChunkCompleteResponse } from '~~/shared/types/response/chunks'

const paramsSchema = fileIdSchema.extend({
  partNumber: z.coerce.number().int().positive(),
})

const bodySchema = z.object({
  etag: z.string().min(1),
})

export default defineEventHandler(async (event): Promise<ChunkCompleteResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId, partNumber } = await validateRequest (event, getValidatedRouterParams, paramsSchema)
  const { etag } = await validateRequest(event, readValidatedBody, bodySchema)

  const prismaClient = usePrismaClient()

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

  try {
    await prismaClient.fileChunk.update({
      where: {
        fileId_partNumber: {
          fileId: file.id,
          partNumber,
        },
      },
      data: {
        etag,
        status: 'UPLOADED',
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    partNumber,
    etag,
  }
})
