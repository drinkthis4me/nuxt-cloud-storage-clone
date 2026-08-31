import type { H3Event } from 'h3'
import type { PrismaClient } from '~~/prisma/generated/client'

export async function validateShareLink(event: H3Event, token: string, prismaClient: PrismaClient) {
  let link

  try {
    link = await prismaClient.shareLink.findUnique({
      where: { token },
      include: { file: true },
    })
  }
  catch (err) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (
    !link
    || link.revokedAt
    || (link.expiresAt && link.expiresAt < new Date())
  ) {
    throw createError({
      ...HTTP_STATUS.NOT_FOUND,
      message: 'This link is no longer available',
    })
  }

  // Check if unlock cookie exist (See: /api/share/[token]/unlock.post.ts)
  if (link.passwordHash && getCookie(event, `share_unlock_${token}`) !== '1') {
    throw createError({ ...HTTP_STATUS.UNAUTHORIZED, message: 'Password required' })
  }

  return link
}
