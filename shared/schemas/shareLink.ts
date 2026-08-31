import { z } from 'zod'
import { sharePermission } from '../const/share'

export { sharePermission }

export const permission = z.enum(Object.values(sharePermission))
const password = z.preprocess(
  val => (val === '') ? undefined : val,
  z.string().min(4).max(100).nullable().optional(),
)
const expiresAt = z.preprocess(
  val => (val === '') ? undefined : val,
  z.iso.datetime().optional(),
)
const uuid = z.uuid({ version: 'v4' })

export const shareLinkSchema = z.object({
  permission: permission.default(sharePermission.VIEW),
  password,
  expiresAt,
})
export type ShareLinkSchema = z.output<typeof shareLinkSchema>

export const editShareLinkSchema = z
  .strictObject({
    permission: permission.optional(),
    password: password.nullable(),
    expiresAt: expiresAt.nullable(),
  })
  .refine(
    data => Object.keys(data).length > 0,
    {
      message: 'Body cannot be empty. At least one field must be provided.',
    },
  )
export type EditShareLinkSchema = z.output<typeof editShareLinkSchema>

export const resolveShareLinkQuerySchema = z.object({
  password: z.string().optional(),
  folder: uuid.optional(),
})

export const shareLinkTokenSchema = z.object({
  token: uuid,
})

export const shareLinkBreadcrumbsSchema = z.object({
  folder: uuid.optional(),
})

export const shareLinkIdSchema = z.object({
  id: uuid, // File id
  linkId: uuid,
})
export type ShareLinkIdSchema = z.output<typeof shareLinkIdSchema>

export const unlockShareLinkSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})
export type UnlockShareLinkSchema = z.output<typeof unlockShareLinkSchema>

export const downloadQuerySchema = z.object({
  fileId: z.uuid().optional(), // omitted = download the link's own target file
})
export type DownloadQuerySchema = z.output<typeof downloadQuerySchema>
