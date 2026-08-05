import DialogCreateNewFolder from '~~/app/components/dialog/DialogCreateNewFolder.vue'
import { folderSchema } from '~~/shared/schemas/file'

import type { FolderSchema } from '~~/shared/schemas/file'
import type { CreateFolderResponse } from '~~/shared/types/response/files'

export const useCreateFolder = () => {
  const overlay = useOverlay()
  const toast = useToast()

  const openDialog = async (): Promise<string | null> => {
    const modal = overlay.create(DialogCreateNewFolder, {
      destroyOnClose: true,
    })

    return modal.open()
  }

  const createFolder = async (body: FolderSchema) => {
    try {
      const validBody = folderSchema.parse(body)

      const res = await $fetch<CreateFolderResponse>('/api/files', {
        method: 'POST',
        body: validBody,
      })

      console.log(res)
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

  const promptAndCreateFolder = async () => {
    const res = await openDialog()

    if (res) {
      console.log('New folder name', res)
      createFolder({
        name: res,
        isFolder: true,
      })
    }
  }

  return {
    promptAndCreateFolder,
  }
}
