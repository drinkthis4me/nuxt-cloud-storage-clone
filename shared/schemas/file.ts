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
export const name = z.string().trim().min(1, 'Required').max(255, 'Too long. Max length: 255 characters.')
const mimeType = z.string().min(1)
const size = z.int().nonnegative().max(500 * 1024 * 1024, 'File exceeds 500MB limit.')
const fingerprint = z.string().length(64, 'Invalid SHA-256 fingerprint')
const parentFolderId = id.nullable().optional()
const statusList = z
  .xor([z.string(), z.array(z.string())])
  .transform((val) => {
    const items = Array.isArray(val) ? val : val.split(',')
    return items.map(s => s.trim()).filter(Boolean)
  })
  .pipe(z.array(z.enum(Object.values(fileStatus))).min(1))

export const fileSchema = z.object({
  isFolder: z.literal(false),
  name,
  mimeType,
  size,
  fingerprint,
  parentFolderId,
})
export type FileSchema = z.output<typeof fileSchema>

export const folderSchema = z.object({
  isFolder: z.literal(true),
  name,
  parentFolderId,
})
export type FolderSchema = z.output<typeof folderSchema>

export const fileIdSchema = z.object({
  id,
})

export const fileListSchema = z.object({
  parentFolderId,
  scope: z.enum(Object.values(fileScope)).default(fileScope.MINE),
  status: statusList.default([fileStatus.UPLOADED, fileStatus.UPLOADING]),
})

export const editFileSchema = z
  .object({
    name: name.optional(),
    parentFolderId,
  })
  .refine(body => body.name !== undefined || body.parentFolderId !== undefined, {
    message: 'Must provide at least one field to update',
  })

export const deleteFileSchema = z.object({
  permanent: z.boolean().default(false),
})
