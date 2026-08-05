import DialogUploadFile from '~/components/dialog/DialogUploadFile.vue'
import { fileSchema } from '~~/shared/schemas/file'

import type { FileSchema } from '~~/shared/schemas/file'
import type {
  CreateFileUploadResponse,
  CompleteUploadResponse,
} from '~~/shared/types/response/files'

export const useUploadFile = () => {
  const overlay = useOverlay()
  const toast = useToast()

  const openDialog = async (): Promise<File | null> => {
    const modal = overlay.create(DialogUploadFile, {
      destroyOnClose: true,
    })

    return modal.open()
  }

  const uploadFile = async (file: File) => {
    try {
      const fingerprint = await sha256(file)

      const body: FileSchema = {
        isFolder: false,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        fingerprint,
        parentFolderId: null,
      }

      const validBody = fileSchema.parse(body)

      const {
        duplicate,
        uploadUrl,
        file: serverFileEntry,
      } = await $fetch<CreateFileUploadResponse>('/api/files', {
        method: 'POST',
        body: validBody,
      })

      if (duplicate) return serverFileEntry

      if (!uploadUrl) throw new Error('No upload url')

      await $fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })

      const {
        file: completedFile,
      } = await $fetch<CompleteUploadResponse>(
        `/api/files/${serverFileEntry.id}/complete`,
        { method: 'POST' },
      )

      toast.add({
        color: 'success',
        title: 'File uploaded',
        description: serverFileEntry.name,
      })

      return completedFile
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
      })
    }
  }

  const promptAndUploadFile = async () => {
    const file = await openDialog()

    if (!file) return

    uploadFile(file)
  }

  return {
    promptAndUploadFile,
  }
}
