import type { BreadcrumbsResponse } from '#shared/types/response/files'

export function useBreadcrumbs(folderId: MaybeRefOrGetter<string | null>) {
  const id = computed(() => toValue(folderId))

  const data = shallowRef<BreadcrumbsResponse | null>(null)
  const lastBreadcrumbs = shallowRef<BreadcrumbsResponse['breadcrumbs']>([])
  const isPending = shallowRef(false)
  const isFirstPending = shallowRef(true)
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

      isPending.value = true
      try {
        data.value = await $fetch<BreadcrumbsResponse>(`/api/files/${currentId}/breadcrumbs`)
        if (data.value?.breadcrumbs) {
          lastBreadcrumbs.value = data.value.breadcrumbs
        }
        isFirstPending.value = false
      }
      catch (err) {
        console.error('Failed to fetch breadcrumbs', err)
        error.value = err
        throw createError({
          fatal: true,
          status: 404,
          statusText: 'Folder/File Not found',
          cause: err,
        })
      }
      finally {
        isPending.value = false
      }
    },
    { immediate: true },
  )

  const breadcrumbs = computed(() => data.value?.breadcrumbs ?? lastBreadcrumbs.value)

  return {
    breadcrumbs,
    error,
    isPending,
    isFirstPending,
  }
}
