import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileIdSchema } from '#shared/schemas/file'

import type { PrismaClient } from '~~/prisma/generated/client'
import type { SerializedFile, BreadcrumbsResponse } from '#shared/types/response/files'

const MAX_DEPTH = 50 // guards against a corrupted/cyclic parentFolderId chain

export default defineEventHandler(async (event): Promise<BreadcrumbsResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)

  const prismaClient = usePrismaClient()

  const chain = await walkAncestorChain(fileId, user.id, prismaClient)

  if (chain === null) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  return { breadcrumbs: chain }
})

async function walkAncestorChain(
  startId: string,
  userId: number,
  prismaClient: PrismaClient,
): Promise<SerializedFile[] | null> {
  const chain: SerializedFile[] = []
  let currentId: string | null = startId
  let depth = 0

  while (currentId) {
    if (depth++ > MAX_DEPTH) {
      throw createError({
        ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Folder chain too deep — possible data corruption',
      })
    }

    let folder
    try {
      folder = await prismaClient.file.findUnique({
        where: { id: currentId },
        include: {
          shares: { where: { userId } },
        },
      })
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }

    if (!folder) return null // broken chain, or the starting id itself doesn't exist

    const isOwner = folder.ownerId === userId
    const hasShareAccess = folder.shares.length > 0
    if (!isOwner && !hasShareAccess) return null // no access at this point in the chain

    chain.unshift(serializeFile(folder))
    currentId = folder.parentFolderId
  }

  return chain
}
