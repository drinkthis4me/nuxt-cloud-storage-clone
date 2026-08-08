import { fileIdSchema } from '#shared/schemas/file'

import type { RestoreFileResponse } from '#shared/types/response/files'

export const useRestoreFile = () => {
  const toast = useToast()
  const trashFileTableStore = useFileTrashTableStore()

  const restore = async (id: string) => {
    try {
      const validId = fileIdSchema.parse({ id })

      const { file } = await $fetch<RestoreFileResponse>(`/api/files/${validId.id}/restore`, {
        method: 'POST',
      })

      toast.add({
        color: 'success',
        title: (file.isFolder ? 'Folder' : 'File') + ' restored',
        description: file.name,
      })

      trashFileTableStore.fetchFiles()
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Restore failed. Please try again.',
      })
    }
  }

  return {
    restore,
  }
}
