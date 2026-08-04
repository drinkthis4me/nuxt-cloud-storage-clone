import DialogCreateNewFolder from '~~/app/components/dialog/DialogCreateNewFolder.vue'
import { folderSchema } from '~~/shared/schemas/file'

import type { FolderSchema } from '~~/shared/schemas/file'
import type { CreateFolderResponse } from '~~/shared/types/response/files'

export const useDialogCreateFolder = () => {
  const overlay = useOverlay()

  const open = async (): Promise<string | null> => {
    const modal = overlay.create(DialogCreateNewFolder, {
      destroyOnClose: true,
    })

    return modal.open()
  }

  const create = async (body: FolderSchema) => {
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
    }
  }

  return {
    open,
    create,
  }
}
