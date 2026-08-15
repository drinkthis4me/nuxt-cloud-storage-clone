import { defineStore, acceptHMRUpdate } from 'pinia'

import type { UploadEntry } from '~/types/uploadEntry'
import type { UploadingFilesResponse } from '~~/shared/types/response/chunks'

/**
Page load / refresh
  → hydrateFromServer() → GET /api/files/uploading → seeds store with chunk-level progress (coarse)

Active upload in this tab
  → xhr.upload.onprogress → store.updateProgress() → smooth, live, byte-level (fine)

User resumes a "paused" (server-seeded) entry
  → client re-fetches chunk state for that file, figures out which parts are missing,
    resumes uploading just those parts, live progress tracking takes back over
 */

export const useUploadQueueStore = defineStore('uploadQueue', () => {
  const entries = ref<Map<UploadEntry['fileId'], UploadEntry>>(new Map())
  const isLoading = shallowRef(false)

  const toast = useToast()

  function reset() {
    entries.value.clear()
  }

  function upsert(entry: UploadEntry) {
    entries.value.set(entry.fileId, entry)
  }

  function updateProgress(fileId: string, uploadedBytes: number) {
    if (entries.value.has(fileId)) {
      entries.value.get(fileId)!.uploadedBytes = uploadedBytes
    }
  }

  function setStatus(fileId: string, status: UploadEntry['status']) {
    if (entries.value.has(fileId)) {
      entries.value.get(fileId)!.status = status
    }
  }

  function remove(fileId: string) {
    entries.value.delete(fileId)
  }

  // Seed the store from the server's chunk state
  async function hydrateFromServer() {
    const skippableStatuses = new Set<UploadEntry['status']>(['uploading', 'paused'])
    isLoading.value = true

    try {
      const { files } = await $fetch<UploadingFilesResponse>('/api/files/uploading')

      for (const entry of files) {
        const existing = entries.value.get(entry.file.id)

        if (existing && skippableStatuses.has(existing.status)) continue

        const bytesPerChunk = entry.totalChunks > 0 ? Number(entry.file.size) / entry.totalChunks : 0

        const uploadEntry: UploadEntry = {
          fileId: entry.file.id,
          name: entry.file.name,
          mimeType: entry.file.mimeType,
          totalBytes: Number(entry.file.size),
          uploadedBytes: Math.round(bytesPerChunk * entry.uploadedChunks), // Best guess from server chunk-completion count
          status: 'paused',
          isChunked: entry.isChunked,
          totalChunks: entry.totalChunks,
          uploadedChunks: entry.uploadedChunks,
          updatedAt: entry.file.updatedAt,
        }

        upsert(uploadEntry)

        const wasStale = existing?.status === 'error' || existing?.status === 'cancelled'
        if (wasStale) {
          toast.add({
            color: 'warning',
            title: `"${entry.file.name}" is still in progress`,
            description: 'A previous cancel or error didn\'t fully complete. You can resume or cancel it again.',
            duration: 0,
          })
        }
      }
    }
    catch (err) {
      console.error(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Failed to fetch uploading files',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    entries,
    isLoading,
    reset,
    upsert,
    updateProgress,
    setStatus,
    remove,
    hydrateFromServer,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploadQueueStore, import.meta.hot))
}
