import DialogRenameFile from '~/components/dialog/DialogRenameFile.vue'
import { fileIdSchema } from '#shared/schemas/file'
import { getRequestErrorMessage } from '~/utils/getRequestErrorMessage'

import type { UpdateFileResponse } from '#shared/types/response/files'

export function useRenameFile() {
  const overlay = useOverlay()
  const toast = useToast()

  async function openDialog(oldName: string): Promise<string | null> {
    const modal = overlay.create(DialogRenameFile,
      { destroyOnClose: true },
    )

    return modal.open({ name: oldName })
  }

  async function rename(fileId: string, newName: string) {
    const parseResult = fileIdSchema.safeParse({ id: fileId })
    if (!parseResult.success) {
      console.error('Parse file ID failed')
      return null
    }

    const validId = parseResult.data.id

    const trimmed = newName.trim()
    if (!trimmed) {
      toast.add({ color: 'error', title: 'Name cannot be empty' })
      return null
    }

    try {
      const { file } = await $fetch<UpdateFileResponse>(
        `/api/files/${validId}`,
        {
          method: 'PATCH',
          body: { name: trimmed },
        },
      )

      return file
    }
    catch (err) {
      console.error('Failed to rename file', err)
      toast.add({
        color: 'error',
        title: 'Failed to rename file',
        description: getRequestErrorMessage(err, 'Failed to rename file'),
      })
      return null
    }
  }

  async function promptAndRename(fileId: string, oldName: string) {
    const res = await openDialog(oldName)

    if (!res || res === oldName) return null

    console.log('New name', res)
    return rename(fileId, res)
  }

  return {
    rename,
    promptAndRename,
  }
}
