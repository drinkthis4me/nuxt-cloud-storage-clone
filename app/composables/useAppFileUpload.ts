import { sha256 } from '~/utils/sha256'

import type {
  SerializedFile,
  CreateFileUploadResponse,
  CompleteUploadResponse,
} from '#shared/types/response/files'

export const useAppFileUpload = () => {
  const upload = async (
    file: File,
    parentFolderId: string | null = null,
  ): Promise<SerializedFile | null> => {
    try {
      const fingerprint = await sha256(file)

      const result = await $fetch<CreateFileUploadResponse>('/api/files', {
        method: 'POST',
        body: {
          isFolder: false,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          fingerprint,
          parentFolderId,
        },
      })

      // 'duplicate' only exists on CreateFileUploadResponse
      if (!('duplicate' in result)) {
        throw new Error('Unexpected response shape from file creation')
      }

      if (result.duplicate) return result.file

      if (!result.uploadUrl) {
        throw new Error('Missing upload URL in response')
      }

      await $fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })

      const { file: completedFile } = await $fetch<CompleteUploadResponse>(
        `/api/files/${result.file.id}/complete`,
        { method: 'POST' },
      )

      return completedFile
    }
    catch (err) {
      // TODO: error handling { ok: false, error }
      console.error(err)
      return null
    }
  }

  return { upload }
}
