import type { SerializedFile } from '#shared/types/response/files'
import type { UploadingFileEntry } from '#shared/types/response/chunks'

export interface UploadEntry {
  fileId: SerializedFile['id']
  name: SerializedFile['name']
  mimeType: SerializedFile['mimeType']
  status: 'uploading' | 'paused' | 'cancelled' | 'error' | 'done'
  totalBytes: number
  uploadedBytes: number
  totalChunks: UploadingFileEntry['totalChunks']
  uploadedChunks: UploadingFileEntry['uploadedChunks']
  isChunked: UploadingFileEntry['isChunked']
  updatedAt: SerializedFile['updatedAt']
  canResume?: boolean
}
