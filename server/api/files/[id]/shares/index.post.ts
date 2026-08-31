import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema } from '~~/shared/schemas/file'
import { shareSchema } from '~~/shared/schemas/share'
import type { CreateShareResponse, ShareSummary } from '~~/shared/types/response/share'

export default defineEventHandler(async (event): Promise<CreateShareResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
  const body = await validateRequest(event, readValidatedBody, shareSchema)
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

  if (body.email === user.email) {
    throw createError({
      ...HTTP_STATUS.BAD_REQUEST,
      message: 'You can\'t share a file with yourself',
    })
  }

  // Link the share to existing user
  let invitedUser
  try {
    invitedUser = await prismaClient.user.findUnique({
      where: { email: body.email },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  let share
  try {
    share = await prismaClient.share.upsert({
      where: {
        fileId_inviteEmail: {
          fileId: file.id,
          inviteEmail: body.email,
        },
      },
      update: {
        permission: body.permission,
        userId: invitedUser?.id ?? null,
      },
      create: {
        id: crypto.randomUUID(),
        fileId: file.id,
        inviteEmail: body.email,
        userId: invitedUser?.id ?? null,
        permission: body.permission,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  const summary: ShareSummary = {
    id: share.id,
    inviteEmail: share.inviteEmail,
    userId: share.userId,
    hasAccount: !!share.userId,
    permission: share.permission,
    createdAt: share.createdAt.toISOString(),
    updatedAt: share.updatedAt.toISOString(),
  }

  return { share: summary }
})
