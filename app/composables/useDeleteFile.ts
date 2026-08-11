import { fileIdSchema } from '#shared/schemas/file'

import type {
  SoftDeleteFileResponse,
  HardDeleteFileResponse,
} from '#shared/types/response/files'

export function useDeleteFile() {
  const toast = useToast()

  async function softDelete(fileIds: string[]) {
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
      validIds.map(id => $fetch<SoftDeleteFileResponse>(`/api/files/${id}`, {
        method: 'DELETE',
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
        title: `${succeededIds.length} ${succeededIds.length > 1 ? 'files' : 'file'} moved to trash bin`,
      })
    }
    else if (succeededIds.length > 0 && failedIds.length > 0) {
      toast.add({
        color: 'success',
        title: `Moved ${succeededIds.length} of ${validIds.length} files to trash bin`,
      })
    }

    for (const [message, count] of failureMessages) {
      toast.add({
        color: 'error',
        title: `Failed to move ${count} ${count === 1 ? 'file' : 'files'} to trash bin`,
        description: message,
      })
    }

    return { succeededIds, failedIds }
  }

  async function hardDelete(fileIds: string[]) {
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
      validIds.map(id => $fetch<HardDeleteFileResponse>(`/api/files/${id}`, {
        method: 'DELETE',
        query: { permanent: true },
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
        title: `${succeededIds.length} ${succeededIds.length > 1 ? 'files' : 'file'} permanent deleted`,
      })
    }
    else if (succeededIds.length > 0 && failedIds.length > 0) {
      toast.add({
        color: 'success',
        title: `Permanently delete ${succeededIds.length} of ${validIds.length} files`,
      })
    }

    for (const [message, count] of failureMessages) {
      toast.add({
        color: 'error',
        title: `Failed to delete ${count} ${count === 1 ? 'file' : 'files'}`,
        description: message,
      })
    }

    return { succeededIds, failedIds }
  }

  return {
    softDelete,
    hardDelete,
  }
}
