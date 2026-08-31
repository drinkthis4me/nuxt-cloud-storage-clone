import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema } from '~~/shared/schemas/file'
import type { ListSharesResponse, ShareSummary } from '~~/shared/types/response/share'

export default defineEventHandler(async (event): Promise<ListSharesResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
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

  let shares
  try {
    shares = await prismaClient.share.findMany({
      where: { fileId: file.id },
      orderBy: { createdAt: 'desc' },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  const summaries: ShareSummary[] = shares.map(share => ({
    id: share.id,
    inviteEmail: share.inviteEmail,
    userId: share.userId,
    hasAccount: !!share.userId,
    permission: share.permission,
    createdAt: share.createdAt.toISOString(),
    updatedAt: share.updatedAt.toISOString(),
  }))

  return { shares: summaries }
})
