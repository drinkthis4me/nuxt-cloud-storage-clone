import DialogCreateNewFolder from '~~/app/components/dialog/DialogCreateNewFolder.vue'
import { folderSchema } from '~~/shared/schemas/file'

import type { FolderSchema } from '~~/shared/schemas/file'
import type { CreateFolderResponse } from '~~/shared/types/response/files'

export function useCreateFolder() {
  const overlay = useOverlay()
  const toast = useToast()

  async function openDialog(): Promise<string | null> {
    const modal = overlay.create(DialogCreateNewFolder, {
      destroyOnClose: true,
    })

    return modal.open()
  }

  async function createFolder(body: FolderSchema) {
    try {
      const validBody = folderSchema.parse(body)

      const { file } = await $fetch<CreateFolderResponse>('/api/files', {
        method: 'POST',
        body: validBody,
      })

      const folderKey = getFolderKey(file.parentFolderId)
      await refreshNuxtData(folderKey)
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Failed to create folder. Please try again.',
      })
    }
  }

  async function promptAndCreateFolder(parentFolderId: string | null = null) {
    const res = await openDialog()

    if (res) {
      createFolder({
        name: res,
        isFolder: true,
        ...(parentFolderId !== null ? { parentFolderId } : {}),
      })
    }
  }

  return {
    promptAndCreateFolder,
  }
}
