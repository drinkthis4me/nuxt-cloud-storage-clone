import type { ListSharesResponse } from '#shared/types/response/share'

export function useShareList(fileId: MaybeRefOrGetter<string>) {
  const id = computed(() => toValue(fileId))

  const {
    data,
    status,
    pending,
    refresh,
  } = useFetch<ListSharesResponse>(
    () => `/api/files/${id.value}/shares`,
    {
      key: () => getShareKey(id),
      watch: [id],
    },
  )

  const shares = computed(() => data.value?.shares ?? [])

  return {
    shares,
    status,
    pending,
    refresh,
  }
}
