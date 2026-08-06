// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { fileStatus } from '~~/shared/schemas/file'

type FileStatusEnum = keyof typeof fileStatus

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
  version: number
}

export interface CreateFolderResponse {
  file: SerializedFile
}

export interface CreateFileUploadResponse {
  duplicate: boolean
  file: SerializedFile
  uploadUrl?: string
}

export type CreateFileResponse = CreateFolderResponse | CreateFileUploadResponse

export interface CompleteUploadResponse {
  file: SerializedFile
}

export interface FileListResponse {
  files: SerializedFile[]
}

export interface DownloadUrlResponse {
  downloadUrl: string
  expiresIn: number
}
