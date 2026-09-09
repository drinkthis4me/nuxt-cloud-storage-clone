<script setup lang="ts">
definePageMeta({
  layout: 'simple',
})

const { validateToken } = useUnlockLink()

const route = useRoute()
let token: string
try {
  token = validateToken(route.params.token)
}
catch (err) {
  console.error('Cannot read token', { cause: err })
  throw createError({
    fatal: true,
    status: 404,
    statusText: 'Could not open link',
    message: 'This link does not exist',
  })
}

const {
  data,
  error,
  refresh,
  isFirstLoading,
  isRefreshing,
} = await useResolveLink(token)

const queryFolder = computed(() => {
  const q = route.query.folder

  if (!q) return null

  return (Array.isArray(q) ? q[0] : q) as string
})

const {
  breadcrumbs,
} = useResolveLinkBreadcrumbs(token, queryFolder)
</script>

<template>
  <div>
    <UContainer>
      <HeroLoading v-if="isFirstLoading || !data" />

      <HeroError v-else-if="error" />

      <FormShareLinkPassword
        v-else-if="data.requiresPassword"
        :token
        @unlocked="refresh"
      />

      <template v-else-if="data.file">
        <div
          v-if="data.file.isFolder && data.children"
          class="flex flex-col gap-4"
        >
          <ClientOnly>
            <ShareLinkBreadcrumb :breadcrumbs />
            <template #fallback>
              <FileBreadcrumbSkeleton />
            </template>
          </ClientOnly>
          <ClientOnly>
            <TableShareLinkContents
              :permission="data.permission"
              :files="data.children"
              :loading="isRefreshing"
              :token
            />
            <template #fallback>
              <TableSkeleton />
            </template>
          </ClientOnly>
        </div>

        <ClientOnly v-else>
          <FileDetail
            :permission="data.permission"
            :file="data.file"
            :token
          />

          <template #fallback>
            <FileDetailSkeketon />
          </template>
        </ClientOnly>
      </template>
    </UContainer>
  </div>
</template>
