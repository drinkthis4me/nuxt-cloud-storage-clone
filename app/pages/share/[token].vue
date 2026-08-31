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
} = useResolveLink(token)

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
          <ShareLinkBreadcrumb :breadcrumbs />
          <TableShareLinkContents
            :permission="data.permission"
            :files="data.children"
            :loading="isRefreshing"
            :token
          />
        </div>

        <FileDetail
          v-else
          :permission="data.permission"
          :file="data.file"
          :token
        />
      </template>
    </UContainer>
  </div>
</template>
