import type { CancelUploadResponse } from '#shared/types/response/chunks'

export function useCancelUpload() {
  const store = useUploadQueueStore()
  const { abort } = useActiveUploads()
  const { showErrorToast } = useErrorToast()

  async function cancelUpload(fileId: string) {
    abort(fileId)
    // Optimistic cancel
    store.setStatus(fileId, 'cancelled')

    try {
      await $fetch<CancelUploadResponse>(`/api/files/${fileId}/chunks`, {
        method: 'DELETE',
      })
    }
    catch (err) {
      console.error('[useCancelUpload] Failed to cancel upload', { cause: err })
      showErrorToast({
        error: err,
        title: 'Cancel upload failed',
      })

      // Roll back the optimistic cancel
      store.setStatus(fileId, 'error')
    }
  }

  return {
    cancelUpload,
  }
}
