import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@@/prisma/generated/client'

let prisma: PrismaClient | undefined

export function usePrismaClient() {
  if (prisma) return prisma

  const config = useRuntimeConfig()

  const adapter = new PrismaBetterSqlite3({ url: config.databaseUrl! })

  prisma = new PrismaClient({ adapter })

  return prisma
}
