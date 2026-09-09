import { fileScope } from '~~/shared/const/file'

import type { FileListResponse } from '#shared/types/response/files'

export function useSharedWithMe() {
  const {
    data,
    status,
    pending,
    error,
    refresh,
  } = useFetch<FileListResponse>('/api/files', {
    method: 'GET',
    query: {
      scope: fileScope.SHARED,
    },
    lazy: true,
  })

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !!data.value)

  const files = computed(() => data.value?.files ?? [])

  return {
    data,
    status,
    pending,
    error,
    refresh,

    files,
    isFirstLoading,
    isRefreshing,
  }
}
