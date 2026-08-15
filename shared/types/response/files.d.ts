/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fileStatus } from '~~/shared/schemas/file'
import { uploadStrategy } from '~~/shared/const/uploadStrategy'

export type FileStatusEnum = (typeof fileStatus)[keyof typeof fileStatus]

export interface SerializedFile {
  id: string
  ownerId: number
  name: string
  mimeType: string
  size: string // BigInt serialized as string
  fingerprint: string
  storageKey: string
  status: FileStatusEnum
  isFolder: boolean
  parentFolderId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
}

export interface FileResponse {
  file: SerializedFile
}

export interface FileListResponse {
  files: SerializedFile[]
}

export interface BreadcrumbsResponse {
  breadcrumbs: SerializedFile[]
}

export interface CreateFolderResponse {
  file: SerializedFile
}

export type UploadStrategyEnum = typeof uploadStrategy

export type CreateFileUploadResponse
  = { duplicate: true, file: SerializedFile }
    | { duplicate: false, file: SerializedFile, uploadStrategy: UploadStrategyEnum['SINGLE'], uploadUrl: string }
    | { duplicate: false, file: SerializedFile, uploadStrategy: UploadStrategyEnum['CHUNKED'] }

export type CreateFileResponse = CreateFolderResponse | CreateFileUploadResponse

export interface DownloadUrlResponse {
  downloadUrl: string
  expiresIn: number
}

export interface HardDeleteFileResponse {
  id: string
  deleted: true
}

export type DeleteFileResponse = FileResponse | HardDeleteFileResponse
