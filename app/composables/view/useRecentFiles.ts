import type { FileListResponse } from '#shared/types/response/files'

export function useRecentFiles(limit: MaybeRefOrGetter<number> = 20) {
  const {
    data,
    status,
    pending,
    error,
    refresh,
  } = useFetch<FileListResponse>('/api/files/recent', {
    query: computed(() => ({ limit: toValue(limit) })),
    lazy: true,
  })

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !!data.value)

  const files = computed(() => data.value?.files ?? [])

  function patchFile(fileIds: string[]) {
    if (!data.value?.files) return

    // Remove files from current list
    const idSet = new Set(fileIds)
    data.value = {
      ...data.value,
      files: data.value.files.filter(f => !idSet.has(f.id)),
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
