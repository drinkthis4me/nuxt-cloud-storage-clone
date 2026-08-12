import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileStatus, fileIdSchema } from '~~/shared/schemas/file'
import type { FileResponse } from '~~/shared/types/response/files'
import type { File } from '~~/prisma/generated/client'

export default defineEventHandler(async (event): Promise<FileResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()
  let file: File | null

  try {
    file = await prismaClient.file.findUnique({
      where: { id: fileId },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  if (file.status !== fileStatus.DELETED) {
    throw createError({ ...HTTP_STATUS.CONFLICT, message: 'File is not deleted' })
  }

  let updated
  try {
    updated = await prismaClient.file.update({
      where: { id: file.id },
      data: {
        status: fileStatus.UPLOADED,
        deletedAt: null,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { file: serializeFile(updated) }
})
