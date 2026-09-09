import { fileScope } from '#shared/schemas/file'

import type { SerializedFile, FileListResponse } from '#shared/types/response/files'

export function useFolderContents(folderId: MaybeRefOrGetter<string | null>) {
  const parentFolderId = computed(() => toValue(folderId))
  const query = computed(() => ({
    ...(parentFolderId.value ? { parentFolderId: parentFolderId.value } : {}),
    scope: fileScope.MINE,
  }))

  const {
    data,
    error,
    status,
    pending,
    refresh,
  } = useFetch<FileListResponse>('/api/files', {
    key: computed(() => getFolderKey(parentFolderId)),
    query,
    watch: [parentFolderId],
    lazy: true,
  })

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !!data.value)

  const files = computed(() => data.value?.files ?? [])

  // Update fn for after editing file to avoid refetching
  function patchFile(fileIds: string[], updated: SerializedFile | null) {
    if (!data.value?.files) return

    if (updated === null) {
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
    pending,
    status,
    isFirstLoading,
    isRefreshing,
    error,
    refresh,
    patchFile,
  }
}
