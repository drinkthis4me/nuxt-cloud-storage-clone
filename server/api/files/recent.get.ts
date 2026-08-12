import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { recentFileListSchema, fileStatus } from '~~/shared/schemas/file'
import type { FileListResponse } from '~~/shared/types/response/files'

export default defineEventHandler(async (event): Promise<FileListResponse> => {
  const { user } = await requireUserSession(event)
  const { limit } = await validateRequest(event, getValidatedQuery, recentFileListSchema)

  const prismaClient = usePrismaClient()
  let files

  try {
    files = await prismaClient.file.findMany({
      where: {
        ownerId: user.id,
        isFolder: false,
        status: { in: [fileStatus.UPLOADED, fileStatus.UPLOADING] },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { files: files.map(serializeFile) }
})
