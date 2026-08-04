import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { serializeFile } from '#server/utils/serializeFile'
import { validateRequest } from '#server/utils/validateRequest'
import { fileListSchema, fileScope } from '#shared/schemas/file'
import { fileStatus } from '~~/shared/schemas/file'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const query = await validateRequest(event, getValidatedQuery, fileListSchema)

  // null/omitted parentFolderId = root level
  const parentFolderId = query.parentFolderId ?? null
  const prismaClient = usePrismaClient()
  let files

  try {
    if (query.scope === fileScope.MINE) {
      files = await prismaClient.file.findMany({
        where: {
          ownerId: user.id,
          parentFolderId,
          status: { not: fileStatus.DELETED },
        },
        orderBy: [{ isFolder: 'desc' }, { name: 'asc' }],
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

  return files.map(serializeFile)
})
