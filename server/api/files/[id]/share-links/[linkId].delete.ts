import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { shareLinkIdSchema } from '~~/shared/schemas/shareLink'

import type { RevokeShareLinkResponse } from '~~/shared/types/response/shareLink'
import type { File, ShareLink } from '~~/prisma/generated/client'

export default defineEventHandler(async (event): Promise<RevokeShareLinkResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId, linkId } = await validateRequest(event, getValidatedRouterParams, shareLinkIdSchema)
  const prismaClient = usePrismaClient()

  let link: ShareLink | null
  try {
    link = await prismaClient.shareLink.findUnique({ where: { id: linkId } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!link || link.fileId !== fileId) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Share link not found' })
  }

  let file: File | null
  try {
    file = await prismaClient.file.findUnique({ where: { id: link.fileId } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Share link not found' })
  }

  if (link.revokedAt) {
    // already revoked, idempotent
    return {
      id: link.id,
      revoked: true,
    }
  }

  try {
    await prismaClient.shareLink.update({
      where: { id: link.id },
      data: { revokedAt: new Date() },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    id: link.id,
    revoked: true,
  }
})
