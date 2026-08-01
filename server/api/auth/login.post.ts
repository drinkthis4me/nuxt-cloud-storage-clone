import { readValidatedBodyWithSchema } from '#server/utils/readValidatedBodyWithSchema'
import { userLoginSchema } from '#shared/schemas/user'
import { usePrismaClient } from '#server/utils/prisma'
import { verifyPassword } from '#imports'
import { HTTP_STATUS } from '#server/utils/httpStatus'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBodyWithSchema(event, userLoginSchema)

  try {
    const prismaClient = usePrismaClient()
    const user = await prismaClient.user.findFirst({
      where: {
        email: body.email,
        isActive: true,
      },
      select: { id: true, email: true, name: true, password: true },
    })

    if (
      !user
      || !await verifyPassword(user.password, body.password)
    ) {
      throw createError({
        ...HTTP_STATUS.UNAUTHORIZED,
        message: 'Bad credentials',
      })
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
      },
      loggedInAt: new Date(),
    })

    return { success: true }
  }
  catch (err) {
    console.log(err)

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }
})
