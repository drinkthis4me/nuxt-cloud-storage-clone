import type { File } from '~~/prisma/generated/client'
import type { SerializedFile } from '~~/shared/types/response/files'

export function serializeFile(file: File): SerializedFile {
  return {
    ...file,
    size: file.size.toString(), // BigInt -> string
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    deletedAt: file.deletedAt?.toISOString() ?? null,
  }
}
