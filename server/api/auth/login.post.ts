import { verifyPassword } from '#imports'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { validateRequest } from '#server/utils/validateRequest'
import { userLoginSchema } from '#shared/schemas/user'

export default defineEventHandler(async (event) => {
  const body = await validateRequest(event, readValidatedBody, userLoginSchema)

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
