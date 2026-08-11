import type { BreadcrumbsResponse } from '#shared/types/response/files'

export function useBreadcrumbs(folderId: MaybeRefOrGetter<string | null>) {
  const id = computed(() => toValue(folderId))

  const data = shallowRef<BreadcrumbsResponse | null>(null)
  const lastBreadcrumbs = shallowRef<BreadcrumbsResponse['breadcrumbs']>([])
  const isRefreshing = shallowRef(false)
  const error = shallowRef<unknown>(null)

  watch(
    id,
    async (currentId) => {
      if (!currentId) {
        // root — no breadcrumb chain, and don't show stale crumbs from a previous folder
        data.value = null
        lastBreadcrumbs.value = []
        return
      }

      isRefreshing.value = true
      try {
        data.value = await $fetch<BreadcrumbsResponse>(`/api/files/${currentId}/breadcrumbs`)
        if (data.value?.breadcrumbs) {
          lastBreadcrumbs.value = data.value.breadcrumbs
        }
      }
      catch (err) {
        console.error('Failed to fetch breadcrumbs', err)
        error.value = err
      }
      finally {
        isRefreshing.value = false
      }
    },
    { immediate: true },
  )

  const breadcrumbs = computed(() => data.value?.breadcrumbs ?? lastBreadcrumbs.value)

  return {
    breadcrumbs,
    isRefreshing,
    error,
  }
}
