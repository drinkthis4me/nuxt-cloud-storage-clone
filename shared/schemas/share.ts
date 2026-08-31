import { z } from 'zod'
import { permission } from './shareLink'
import { fileIdSchema } from './file'
import { email } from './user'

export const shareSchema = z.object({
  email,
  permission,
})
export type ShareSchema = z.output<typeof shareSchema>

export const shareIdSchema = fileIdSchema.extend({
  shareId: z.uuid({ version: 'v4' }),
})
export type ShareIdSchema = z.output<typeof shareIdSchema>
