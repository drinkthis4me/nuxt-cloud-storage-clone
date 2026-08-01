import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@@/prisma/generated/client'

export const usePrismaClient = () => {
  const config = useRuntimeConfig()

  const adapter = new PrismaBetterSqlite3({ url: config.databaseUrl! })

  return new PrismaClient({ adapter })
}
