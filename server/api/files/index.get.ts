import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { serializeFile } from '#server/utils/serializeFile'
import { validateRequest } from '#server/utils/validateRequest'
import { fileListSchema, fileScope, fileStatus } from '#shared/schemas/file'

import type { File } from '~~/prisma/generated/client'
import type { FileStatusEnum } from '#shared/types/response/files'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const query = await validateRequest(event, getValidatedQuery, fileListSchema)

  const parentFolderId = query.parentFolderId ?? null
  const status = query.status as FileStatusEnum[]
  const isTrashView = query.status.length === 1 && query.status[0] === fileStatus.DELETED

  const prismaClient = usePrismaClient()
  let files: File[] | null

  try {
    if (query.scope === fileScope.MINE) {
      files = await prismaClient.file.findMany({
        where: {
          ownerId: user.id,

          parentFolderId,

          status: { in: status },

          ...(isTrashView ? {} : { parentFolderId }),
        },
        orderBy: isTrashView
          ? [{ deletedAt: 'desc' }]
          : [{ isFolder: 'desc' }, { name: 'asc' }],
      })
    }
    else if (query.scope === fileScope.SHARED) {
      const shares = await prismaClient.share.findMany({
        where: { userId: user.id },
        include: { file: true },
      })

      files = shares
        .map(share => share.file)
        .filter(file => file.status !== fileStatus.DELETED && file.parentFolderId === parentFolderId)
    }
    else {
      // 'ALL' scope.
      // Ignore 'DELETED' status (trash is owner only)
      const [owned, shares] = await Promise.all([
        prismaClient.file.findMany({
          where: {
            ownerId: user.id,
            parentFolderId,
            status: { not: fileStatus.DELETED },
          },
        }),
        prismaClient.share.findMany({
          where: { userId: user.id },
          include: { file: true },
        }),
      ])

      const sharedFiles = shares
        .map(share => share.file)
        .filter(file => file.status !== fileStatus.DELETED && file.parentFolderId === parentFolderId)

      files = [...owned, ...sharedFiles]
    }
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    files: files.map(serializeFile),
  }
})
