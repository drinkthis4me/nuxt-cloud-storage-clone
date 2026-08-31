import type { SharedByMeResponse } from '#shared/types/response/shareLink'

export function useSharedByMe() {
  const {
    data,
    status,
    pending,
    error,
    refresh,
  } = useFetch<SharedByMeResponse>('/api/files/shared-by-me')

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !data.value)

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
