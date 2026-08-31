import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { fileIdSchema } from '~~/shared/schemas/file'

import type { ListShareLinksResponse, ShareLinkSummary } from '~~/shared/types/response/shareLink'
import type { File, ShareLink } from '~~/prisma/generated/client'

export default defineEventHandler(async (event): Promise<ListShareLinksResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
  const prismaClient = usePrismaClient()

  let file: File | null
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

  let links: ShareLink[]
  try {
    links = await prismaClient.shareLink.findMany({
      where: {
        fileId: file.id,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  const summaries: ShareLinkSummary[] = links.map(link => ({
    id: link.id,
    permission: link.permission,
    hasPassword: !!link.passwordHash,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
    token: link.token,
  }))

  return {
    links: summaries,
  }
})
