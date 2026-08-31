import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { shareLinkTokenSchema } from '~~/shared/schemas/shareLink'
import { unlockShareLinkSchema } from '#shared/schemas/shareLink'

import type { ShareLink } from '~~/prisma/generated/client'

export default defineEventHandler(async (event) => {
  const { token } = await validateRequest(event, getValidatedRouterParams, shareLinkTokenSchema)
  const { password } = await validateRequest(event, readValidatedBody, unlockShareLinkSchema)
  const prismaClient = usePrismaClient()

  let shareLink: ShareLink | null
  try {
    shareLink = await prismaClient.shareLink.findUnique({ where: { token } })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!shareLink || shareLink.revokedAt || (shareLink.expiresAt && shareLink.expiresAt < new Date())) {
    throw createError({
      ...HTTP_STATUS.NOT_FOUND,
      message: 'This link is no longer available',
    })
  }

  if (!shareLink.passwordHash) {
    throw createError({
      ...HTTP_STATUS.BAD_REQUEST,
      message: 'This link does not require a password',
    })
  }

  const matches = await verifyPassword(shareLink.passwordHash, password)
  if (!matches) {
    throw createError({ ...HTTP_STATUS.UNAUTHORIZED, message: 'Incorrect password' })
  }

  // Set a cookie scoped to this token
  // Subsequent GETs to /api/share/:token check for this instead of a password
  setCookie(event, `share_unlock_${token}`, '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
  })

  return { unlocked: true }
})
