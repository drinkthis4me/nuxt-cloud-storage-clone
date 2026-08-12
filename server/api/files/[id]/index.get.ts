import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileIdSchema } from '#shared/schemas/file'

import type { FileResponse } from '#shared/types/response/files'

export default defineEventHandler(async (event): Promise<FileResponse> => {
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
  const hasShareAccess = file.shares.length > 0

  if (!isOwner && !hasShareAccess) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  return { file: serializeFile(file) }
})
