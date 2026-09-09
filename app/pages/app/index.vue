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
  refresh,
  patchFile,
} = useRecentFiles()

function handleFileDeleted(ids: string[]) {
  patchFile(ids)
}
</script>

<template>
  <UDashboardPanel id="index">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="text-base capitalize">
            Recent files
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isFirstLoading" />

      <HeroEmpty v-else-if="files.length === 0" />

      <HeroError v-else-if="error" />

      <ClientOnly v-else>
        <TableRecentFile
          :files
          :loading="isRefreshing"
          class="flex-1"
          @refresh="refresh"
          @file-deleted="handleFileDeleted"
        />
        <template #fallback>
          <TableSkeleton />
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
