import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { shareIdSchema } from '~~/shared/schemas/share'
import type { RevokeShareResponse } from '~~/shared/types/response/share'

export default defineEventHandler(async (event): Promise<RevokeShareResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId, shareId } = await validateRequest(event, getValidatedRouterParams, shareIdSchema)
  const prismaClient = usePrismaClient()

  let share

  try {
    share = await prismaClient.share.findUnique({ where: { id: shareId } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!share || share.fileId !== fileId) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Share not found' })
  }

  let file
  try {
    file = await prismaClient.file.findUnique({ where: { id: share.fileId } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Share not found' })
  }

  try {
    await prismaClient.share.delete({ where: { id: share.id } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    id: share.id,
    revoked: true,
  }
})
