/* eslint-disable @typescript-eslint/consistent-type-imports */
import { sharePermission } from '~~/shared/schemas/share'

export type SharePermissionEnum = (typeof sharePermission)[keyof typeof sharePermission]

export interface ShareSummary {
  id: string
  inviteEmail: string
  userId: number | null
  hasAccount: boolean
  permission: SharePermissionEnum
  createdAt: string
  updatedAt: string
}

export interface CreateShareResponse {
  share: ShareSummary
}

export interface ListSharesResponse {
  shares: ShareSummary[]
}

export interface RevokeShareResponse {
  id: string
  revoked: true
}
