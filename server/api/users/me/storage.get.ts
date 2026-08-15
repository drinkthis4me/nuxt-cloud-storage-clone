import { INTERNAL_SERVER_ERROR } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'

import type { StorageResponse } from '#shared/types/response/storage'

export default defineEventHandler(async (event): Promise<StorageResponse> => {
  const { user } = await requireUserSession(event)

  const prismaClient = usePrismaClient()
  const config = useAppConfig()

  try {
    const summary = await prismaClient.file.aggregate({
      _sum: { size: true },
      where: {
        ownerId: user.id,
        isFolder: false,
      },
    })

    return {
      usage: (summary._sum.size ?? 0n).toString(),
      quota: config.storage.quotaBytes.toString(),
    }
  }
  catch (err: unknown) {
    console.error(err)

    throw createError({
      ...INTERNAL_SERVER_ERROR,
    })
  }
})
