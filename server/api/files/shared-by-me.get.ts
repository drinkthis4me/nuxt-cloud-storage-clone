import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'

import type { SerializedFile } from '~~/shared/types/response/files'
import type { SharedByMeResponse } from '~~/shared/types/response/shareLink'

export default defineEventHandler(async (event): Promise<SharedByMeResponse> => {
  const { user } = await requireUserSession(event)
  const prismaClient = usePrismaClient()

  let shareLinks
  try {
    shareLinks = await prismaClient.shareLink.findMany({
      where: { createdBy: user.id, revokedAt: null },
      include: { file: true },
      orderBy: [{ createdAt: 'desc' }, { fileId: 'desc' }],
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  let directShares
  try {
    directShares = await prismaClient.share.findMany({
      where: { file: { ownerId: user.id } },
      include: { file: true },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  // Dedupe by fileId
  const fileMap = new Map<string, SerializedFile>()
  for (const link of shareLinks) {
    fileMap.set(link.file.id, serializeFile(link.file))
  }
  for (const share of directShares) {
    fileMap.set(share.file.id, serializeFile(share.file))
  }

  return {
    files: Array.from(fileMap.values()),
  }
})
