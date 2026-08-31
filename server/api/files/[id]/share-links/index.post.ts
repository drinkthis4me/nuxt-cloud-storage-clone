import { hashPassword } from '#imports'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { fileIdSchema } from '~~/shared/schemas/file'
import { shareLinkSchema } from '~~/shared/schemas/shareLink'

import type { ShareLinkResponse } from '~~/shared/types/response/shareLink'
import type { File, ShareLink } from '~~/prisma/generated/client'

export default defineEventHandler(async (event): Promise<ShareLinkResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
  const body = await validateRequest(event, readValidatedBody, shareLinkSchema)

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

  let existing: ShareLink | null
  try {
    existing = await prismaClient.shareLink.findFirst({
      where: {
        fileId: file.id,
        permission: body.permission,
        revokedAt: null,
        passwordHash: body.password ? { not: null } : null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    })
  }
  catch (err) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (existing) {
    return {
      id: existing.id,
      token: existing.token,
      permission: existing.permission,
      hasPassword: !!existing.passwordHash,
      expiresAt: existing.expiresAt?.toISOString() ?? null,
      createdAt: existing.createdAt.toISOString(),
    }
  }

  let passwordHash: string | null = null
  if (body.password) {
    try {
      passwordHash = await hashPassword(body.password)
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }
  }

  let link: ShareLink
  try {
    link = await prismaClient.shareLink.create({
      data: {
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        fileId: file.id,
        createdBy: user.id,
        permission: body.permission,
        passwordHash,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    id: link.id,
    token: link.token,
    permission: link.permission,
    hasPassword: !!link.passwordHash,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
  }
})
