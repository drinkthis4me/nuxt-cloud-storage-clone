import { prismaClient } from '#server/utils/prisma'
import { INTERNAL_SERVER_ERROR } from '#server/utils/httpStatus'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const users = await prismaClient.user.findMany({
      where: { isActive: true },
      omit: { password: true },
    })
    return users
  }
  catch (err) {
    console.error(err)

    throw createError({
      ...INTERNAL_SERVER_ERROR,
    })
  }
})
