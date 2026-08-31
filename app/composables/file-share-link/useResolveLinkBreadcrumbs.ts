import type { ShareLinkBreadcrumbsResponse } from '~~/shared/types/response/shareLink'

export function useResolveLinkBreadcrumbs(
  token: MaybeRefOrGetter<string>,
  folderId: MaybeRefOrGetter<string | null>,
) {
  const tokenValue = computed(() => toValue(token))
  const query = computed(() => {
    const folderIdValue = toValue(folderId)

    return folderIdValue !== null ? { folder: folderIdValue } : undefined
  })

  const {
    data,
    error,
    status,
    pending,
    refresh,
  } = useFetch<ShareLinkBreadcrumbsResponse>(() => `/api/share/${tokenValue.value}/breadcrumbs`, {
    query,
    lazy: true,
    watch: [query],
  })

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !!data.value)

  const breadcrumbs = computed(() => data.value?.breadcrumbs ?? [])

  return {
    data,
    error,
    status,
    pending,
    refresh,

    isFirstLoading,
    isRefreshing,
    breadcrumbs,
  }
}
