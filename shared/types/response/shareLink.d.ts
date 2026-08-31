/* eslint-disable @typescript-eslint/consistent-type-imports */
import { sharePermission } from '~~/shared/const/share'
import type { SerializedFile } from './files'

export type SharePermissionEnum = (typeof sharePermission)[keyof typeof sharePermission]

export interface ShareLinkResponse {
  id: string
  token: string
  permission: SharePermissionEnum
  hasPassword: boolean
  expiresAt: string | null
  createdAt: string
}

export interface ResolveShareLinkResponse {
  requiresPassword: false
  file: SerializedFile
  permission: SharePermissionEnum
  children?: SerializedFile[]
}

export interface ShareLinkPasswordRequiredResponse {
  requiresPassword: true
}

export type ResolveShareLinkResult = ResolveShareLinkResponse | ShareLinkPasswordRequiredResponse

export interface ShareLinkBreadcrumbsResponse {
  breadcrumbs: SerializedFile[]
}

export interface ShareLinkSummary {
  id: string
  permission: SharePermissionEnum
  hasPassword: boolean
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
  token: string
}

export interface ListShareLinksResponse {
  links: ShareLinkSummary[]
}

export interface RevokeShareLinkResponse {
  id: string
  revoked: true
}

export interface SharedByMeResponse {
  files: SerializedFile[]
}
