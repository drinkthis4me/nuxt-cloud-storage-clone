import { fileIdSchema } from '#shared/schemas/file'
import { getRequestErrorMessage } from '~/utils/getRequestErrorMessage'

import type { UpdateFileResponse } from '#shared/types/response/files'

export const useMoveFile = () => {
  const toast = useToast()

  const moveFiles = async (fileIds: string[], targetFolderId: string) => {
    const parseResults = fileIds.map(id => fileIdSchema.safeParse({ id }))

    const validIds: string[] = []
    for (const result of parseResults) {
      if (!result.success) {
        toast.add({
          color: 'error',
          title: 'Error',
          description: 'Incorrect file ID',
        })
        return
      }
      validIds.push(result.data.id)
    }

    const results = await Promise.allSettled(
      validIds.map(id =>
        $fetch<UpdateFileResponse>(`/api/files/${id}`, {
          method: 'PATCH',
          body: { parentFolderId: targetFolderId },
        }),
      ),
    )

    const failures = results
      .map((result, i) => ({ result, id: validIds[i] }))
      .filter(r => r.result.status === 'rejected')
    const succeeded = results.filter(r => r.status === 'fulfilled').length

    if (failures.length === 0) {
      toast.add({
        color: 'success',
        title: `${succeeded} ${succeeded > 1 ? 'Files' : 'File'} moved`,
      })
    }

    if (succeeded > 0 && failures.length > 0) {
      toast.add({
        color: 'success',
        title: `Moved ${succeeded} of ${validIds.length} files`,
      })
    }

    const grouped = new Map<string, number>()
    for (const failure of failures) {
      const msg = getRequestErrorMessage((failure.result as PromiseRejectedResult).reason)
      grouped.set(msg, (grouped.get(msg) ?? 0) + 1)
    }

    for (const [message, count] of grouped) {
      toast.add({
        color: 'error',
        title: `Failed to move ${count} ${count === 1 ? 'file' : 'files'}`,
        description: message,
      })
    }
  }

  return { moveFiles }
}
