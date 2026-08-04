<script setup lang="ts">
import type { SerializedFile } from '~~/shared/types/response/files'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { data } = await useLazyFetch<SerializedFile[]>('/api/files')
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
      <FileTable :files="data" />
    </template>
  </UDashboardPanel>
</template>
