import { fileIdSchema } from '#shared/schemas/file'

import type { RestoreFileResponse } from '#shared/types/response/files'

export const useRestoreFile = () => {
  const toast = useToast()

  const restore = async (fileIds: string[]) => {
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
      validIds.map(id =>
        $fetch<RestoreFileResponse>(`/api/files/${id}/restore`, {
          method: 'POST',
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
      }
    })

    if (failedIds.length === 0 && succeededIds.length > 0) {
      toast.add({
        color: 'success',
        title: `${succeededIds.length} ${succeededIds.length > 1 ? 'files' : 'file'} restored`,
      })
    }
    else if (succeededIds.length > 0 && failedIds.length > 0) {
      toast.add({
        color: 'success',
        title: `Restored ${succeededIds.length} of ${validIds.length} files`,
      })
    }

    for (const [message, count] of failureMessages) {
      toast.add({
        color: 'error',
        title: `Failed to restore ${count} ${count === 1 ? 'file' : 'files'}`,
        description: message,
      })
    }

    return { succeededIds, failedIds }
  }

  return {
    restore,
  }
}
