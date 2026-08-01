import { z } from 'zod'

export const fileStatus = {
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  DELETED: 'DELETED',
} as const

const id = z.uuid({ version: 'v4' })
const name = z.string().min(1).max(255)
const mimeType = z.string().min(1)
const size = z.coerce.bigint().positive()
const fingerprint = z.string().min(64) // sha256 hex
const parentFolderId = z.string().nullable().optional()

export const fileMetadataSchema = z.object({
  name,
  mimeType,
  size,
  fingerprint,
  parentFolderId,
})

export const fileIdSchema = z.object({
  id,
})
