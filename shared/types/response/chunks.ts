import type { SerializedFile } from './files'

export interface InitChunkedUploadResponse {
  uploadId: string
  chunkSize: number
  totalChunks: number
}

export interface ChunkStatusResponse {
  uploadId: string
  chunks: { partNumber: number, status: 'PENDING' | 'UPLOADED' | 'UPLOADING' }[]
}

export interface ChunkPresignedUrlResponse {
  uploadUrl: string
  partNumber: number
}

export interface UploadingFileEntry {
  file: SerializedFile
  totalChunks: number
  uploadedChunks: number
  isChunked: boolean
}

export interface UploadingFilesResponse {
  files: UploadingFileEntry[]
}

export interface ChunkCompleteResponse {
  partNumber: number
  etag: string
}

export interface FinalizeChunkedUploadResponse {
  file: SerializedFile
}

export interface CancelUploadResponse {
  id: string
  cancelled: true
}
