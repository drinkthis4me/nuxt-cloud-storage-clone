import type { ListShareLinksResponse } from '~~/shared/types/response/shareLink'

export function useShareLinkList(fileId: MaybeRefOrGetter<string>) {
  const id = computed(() => toValue(fileId))

  const {
    data,
    status,
    pending,
    refresh,
  } = useFetch<ListShareLinksResponse>(
    () => `/api/files/${id.value}/share-links`,
    {
      key: () => getShareLinkKey(id),
      watch: [id],
    },
  )

  const links = computed(() => data.value?.links ?? [])

  return {
    links,
    status,
    pending,
    refresh,
  }
}
