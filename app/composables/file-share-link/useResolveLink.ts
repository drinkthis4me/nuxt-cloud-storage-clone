import type { ResolveShareLinkResult } from '#shared/types/response/shareLink'
import type { LocationQueryValue } from 'vue-router'

interface CustomQuery {
  folder?: LocationQueryValue | string
}

export function useResolveLink(
  token: MaybeRefOrGetter<string>,
  customQuery?: MaybeRefOrGetter<CustomQuery>,
) {
  const route = useRoute()

  const tokenValue = computed(() => toValue(token))
  const query = computed(() => {
    const resolvedCustomQuery = customQuery ? toValue(customQuery) : undefined

    if (resolvedCustomQuery !== undefined) {
      return resolvedCustomQuery
    }

    return route.query.folder ? { folder: route.query.folder } : undefined
  })

  const {
    data,
    error,
    status,
    pending,
    refresh,
  } = useFetch<ResolveShareLinkResult>(() => `/api/share/${tokenValue.value}`, {
    query,
    watch: [query],
    lazy: true,
  })

  const isFirstLoading = computed(() => pending.value && !data.value)
  const isRefreshing = computed(() => pending.value && !!data.value)

  return {
    data,
    error,
    status,
    pending,
    refresh,

    isFirstLoading,
    isRefreshing,
  }
}
