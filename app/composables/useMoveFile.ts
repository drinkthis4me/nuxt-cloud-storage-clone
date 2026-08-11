import DialogMoveFile from '~/components/dialog/moveFile/DialogMoveFile.vue'
import { fileIdSchema } from '#shared/schemas/file'
import { getRequestErrorMessage } from '~/utils/getRequestErrorMessage'

import type { UpdateFileResponse } from '#shared/types/response/files'

export function useMoveFile() {
  const overlay = useOverlay()
  const toast = useToast()

  interface OpenDialogOption {
    name: string
    parentFolderId: string | null
    movingIds: string[]
  }

  async function openDialog(props: OpenDialogOption): Promise<{ newParentFolderId: string | null } | null> {
    const modal = overlay.create(DialogMoveFile, { destroyOnClose: true })

    return modal.open(props)
  }

  interface MoveFilesResult {
    succeededIds: string[]
    failedIds: string[]
  }

  async function moveFiles(fileIds: string[], targetFolderId: string | null): Promise<MoveFilesResult> {
    const parseResults = fileIds.map(id => fileIdSchema.safeParse({ id }))

    const validIds: string[] = []
    for (const result of parseResults) {
      if (!result.success) {
        console.error('Parse file IDs failed')
        toast.add({ color: 'error', title: 'Invalid file selection' })
        return { succeededIds: [], failedIds: fileIds }
      }
      validIds.push(result.data.id)
    }

    const results = await Promise.allSettled(
      validIds.map(id => $fetch<UpdateFileResponse>(`/api/files/${id}`, {
        method: 'PATCH',
        body: { parentFolderId: targetFolderId },
      }),
      ),
    )

    const succeededIds: string[] = []
    const failedIds: string[] = []
    const failureMessages = new Map<string, number>()

    results.forEach((result, i) => {
      const id = validIds[i]!
      if (result.status === 'fulfilled') {
        succeededIds.push(id)
      }
      else {
        failedIds.push(id)
        const msg = getRequestErrorMessage(result.reason)
        failureMessages.set(msg, (failureMessages.get(msg) ?? 0) + 1)
      }
    })

    if (failedIds.length === 0 && succeededIds.length > 0) {
      toast.add({
        color: 'success',
        title: `${succeededIds.length} ${succeededIds.length > 1 ? 'files' : 'file'} moved`,
      })
    }
    else if (succeededIds.length > 0 && failedIds.length > 0) {
      toast.add({
        color: 'success',
        title: `Moved ${succeededIds.length} of ${validIds.length} files`,
      })
    }

    for (const [message, count] of failureMessages) {
      toast.add({
        color: 'error',
        title: `Failed to move ${count} ${count === 1 ? 'file' : 'files'}`,
        description: message,
      })
    }

    return { succeededIds, failedIds }
  }

  async function promptAndMove(
    filesToMove: { id: string, name: string } [],
    parentFolderId: string | null,
  ): Promise<MoveFilesResult | null> {
    if (filesToMove.length === 0) return null

    const fileName = filesToMove.length === 1 ? filesToMove[0]!.name : `${filesToMove.length} files`
    const movingIds = filesToMove.map(file => file.id)
    const res = await openDialog({
      name: fileName,
      parentFolderId,
      movingIds,
    })

    // Dialog cancelled
    if (res === null) return null

    // return null
    return moveFiles(movingIds, res.newParentFolderId)
  }

  return {
    moveFiles,
    promptAndMove,
  }
}
