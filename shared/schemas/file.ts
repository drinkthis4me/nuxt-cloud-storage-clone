import { z } from 'zod'

export const fileStatus = {
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  DELETED: 'DELETED',
} as const

export const fileScope = {
  MINE: 'MINE',
  SHARED: 'SHARED',
  ALL: 'ALL',
} as const

export const sharePermission = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
} as const

const id = z.uuid({ version: 'v4' })
const name = z.string().min(1).max(255)
const mimeType = z.string().min(1)
const size = z.coerce.bigint().positive()
const fingerprint = z.string().length(64) // sha256 hex
const parentFolderId = z.string().nullable().optional()

export const fileSchema = z.object({
  isFolder: z.literal(false),
  name,
  mimeType,
  size,
  fingerprint,
  parentFolderId,
})

export const folderSchema = z.object({
  isFolder: z.literal(true),
  name,
  parentFolderId,
})

export const fileIdSchema = z.object({
  id,
})

export const fileListSchema = z.object({
  parentFolderId,
  scope: z.enum(Object.keys(fileScope)).default('mine'),
})
