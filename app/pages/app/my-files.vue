<script setup lang="ts">
import type { FileListResponse } from '~~/shared/types/response/files'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { data } = await useLazyFetch<FileListResponse>('/api/files?scope=MINE')
</script>

<template>
  <UDashboardPanel id="my-files">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <FileBreadcrumb />
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <FileTable :files="data?.files" />
    </template>
  </UDashboardPanel>
</template>
