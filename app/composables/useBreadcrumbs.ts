import type { BreadcrumbsResponse } from '#shared/types/response/files'

export const useBreadcrumbs = (folderId: MaybeRefOrGetter<string | null>) => {
  const id = computed(() => toValue(folderId))

  const { data, status } = useFetch<BreadcrumbsResponse>(
    () => `/api/files/${id.value}/breadcrumbs`,
    {
      key: computed(() => `breadcrumbs-${id.value}`),
      watch: [id],
      lazy: true,
      immediate: computed(() => id.value !== null).value,
    },
  )

  const lastBreadcrumbs = shallowRef<BreadcrumbsResponse['breadcrumbs']>([])

  watch(data, (val) => {
    if (val?.breadcrumbs) {
      lastBreadcrumbs.value = val.breadcrumbs
    }
  }, { immediate: true })

  const breadcrumbs = computed(() => data.value?.breadcrumbs ?? lastBreadcrumbs.value)
  const isRefreshing = computed(() => status.value === 'pending')

  return {
    breadcrumbs,
    isRefreshing,
  }
}
