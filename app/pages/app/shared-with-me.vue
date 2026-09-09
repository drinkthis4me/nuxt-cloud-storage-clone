<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const {
  files,
  isFirstLoading,
  isRefreshing,
  error,
} = useSharedWithMe()

// TODO: breadcrumb
</script>

<template>
  <UDashboardPanel id="shared-with-me">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="text-base capitalize">
            Shared with me
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isFirstLoading" />

      <HeroError v-else-if="error" />

      <HeroEmpty v-else-if="files.length === 0" />

      <ClientOnly v-else>
        <TableSharedWithMe
          :files
          :loading="isRefreshing"
          class="flex-1"
        />
        <template #fallback>
          <TableSkeleton />
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
