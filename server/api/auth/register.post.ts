import { HTTP_STATUS } from '#server/utils/httpStatus'
import { usePrismaClient } from '#server/utils/prisma'
import { validateRequest } from '#server/utils/validateRequest'
import { userCreateSchema } from '#shared/schemas/user'
import { Prisma } from '@@/prisma/generated/client'

export default defineEventHandler(async (event) => {
  const body = await validateRequest(event, readValidatedBody, userCreateSchema)

  const prismaClient = usePrismaClient()

  try {
    const hashedPassword = await hashPassword(body.password)

    const user = await prismaClient.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name ?? null,
      },
      select: { id: true, email: true, name: true },
    })

    // Link file share (by other user) to this new account
    // (See: /server/api/files/[id]/shares/index.post.ts)
    await prismaClient.share.updateMany({
      where: {
        inviteEmail: body.email,
        userId: null,
      },
      data: {
        userId: user.id,
      },
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
