import { userCreateSchema } from '#shared/schemas/user'
import { readValidatedBodyWithSchema } from '#server/utils/readValidatedBodyWithSchema'
import { usePrismaClient } from '#server/utils/prisma'
import { Prisma } from '@@/prisma/generated/client'
import { HTTP_STATUS } from '#server/utils/httpStatus'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBodyWithSchema(event, userCreateSchema)

  try {
    const prismaClient = usePrismaClient()

    const hashedPassword = await hashPassword(body.password)

    const user = await prismaClient.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name ?? null,
      },
      select: { id: true, email: true, name: true },
    })

    await setUserSession(event, {
      user,
      loggedInAt: new Date(),
    })

    return user
  }
  catch (err: unknown) {
    console.log(err)

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw createError({
        ...HTTP_STATUS.CONFLICT,
        statusText: 'Email already registered',
      })
    }

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }
})
