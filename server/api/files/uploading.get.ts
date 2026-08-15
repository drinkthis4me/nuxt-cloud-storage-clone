import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileStatus } from '~~/shared/schemas/file'

import type { UploadingFilesResponse } from '~~/shared/types/response/chunks'

export default defineEventHandler(async (event): Promise<UploadingFilesResponse> => {
  const { user } = await requireUserSession(event)
  const prismaClient = usePrismaClient()

  let files

  try {
    files = await prismaClient.file.findMany({
      where: {
        ownerId: user.id,
        status: fileStatus.UPLOADING,
        isFolder: false,
      },
      include: { fileChunks: true },
      orderBy: { createdAt: 'desc' },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    files: files.map(f => ({
      file: serializeFile(f),
      totalChunks: f.fileChunks.length,
      uploadedChunks: f.fileChunks.filter(c => c.status === 'UPLOADED').length,
      isChunked: f.fileChunks.length > 0,
    })),
  }
})
