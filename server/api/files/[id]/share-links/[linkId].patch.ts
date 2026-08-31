import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { shareLinkIdSchema, editShareLinkSchema } from '~~/shared/schemas/shareLink'

import type { ShareLinkResponse } from '~~/shared/types/response/shareLink'
import type { File, ShareLink } from '~~/prisma/generated/client'

export default defineEventHandler(async (event): Promise<ShareLinkResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId, linkId } = await validateRequest(event, getValidatedRouterParams, shareLinkIdSchema)
  const body = await validateRequest(event, readValidatedBody, editShareLinkSchema)
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

  const finalPassword
    = body.password === null
      ? null
      : typeof body.password === 'string'
        ? await hashPassword(body.password)
        : undefined

  let updated: ShareLink
  try {
    updated = await prismaClient.shareLink.update({
      where: { id: link.id },
      data: {
        ...(body.permission !== undefined && { permission: body.permission }),
        ...(body.password !== undefined && { passwordHash: finalPassword }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt }),
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    id: updated.id,
    token: updated.token,
    permission: updated.permission,
    hasPassword: !!updated.passwordHash,
    expiresAt: updated.expiresAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
  }
})
