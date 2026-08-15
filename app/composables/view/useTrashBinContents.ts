import { fileScope, fileStatus } from '#shared/schemas/file'
import type { SerializedFile, FileListResponse } from '#shared/types/response/files'

export function useTrashBinContents() {
  const query = computed(() => ({
    scope: fileScope.MINE,
    status: fileStatus.DELETED,
  }))

  // FIXME: extract to getFetchKey util
  const {
    data,
    status,
    pending,
    error,
    refresh,
  } = useFetch<FileListResponse>('/api/files', {
    key: 'trash-bin',
    query,
  })

  const isFirstPending = shallowRef(true)
  watchOnce(status, (val) => {
    if (val === 'success' || val === 'error') {
      isFirstPending.value = false
    }
  })

  const files = computed(() => data.value?.files ?? [])

  // Update fn for after editing file to avoid refetching
  function patchFile(fileIds: string[], updated: SerializedFile | null) {
    if (!data.value?.files) return

    if (updated == null) {
      // Files deleted
      const idSet = new Set(fileIds)
      data.value = {
        ...data.value,
        files: data.value.files.filter(f => !idSet.has(f.id)),
      }
    }
    else {
      // One file updated
      data.value = {
        ...data.value,
        files: data.value.files.map(f => (f.id === fileIds[0]! ? updated : f)),
      }
    }
  }

  return {
    files,
    isPending: pending,
    isFirstPending,
    error,
    refresh,
    patchFile,
  }
}
