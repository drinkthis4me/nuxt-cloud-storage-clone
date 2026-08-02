import type { File } from '~~/prisma/generated/client'

export function serializeFile(file: File) {
  return {
    ...file,
    size: file.size.toString(), // BigInt -> string
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  }
}
