import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@@/prisma/generated/client'

const prismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>

export const prismaClient = prismaClientSingleton()
