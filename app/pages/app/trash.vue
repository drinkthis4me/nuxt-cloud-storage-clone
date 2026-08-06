<script setup lang="ts">
import type { FileListResponse } from '~~/shared/types/response/files'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { data } = await useLazyFetch<FileListResponse>('/api/files?scope=MINE&status=DELETED')
</script>

<template>
  <UDashboardPanel id="trash">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <h1 class="text-base">
            Trash bin
          </h1>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <FileTrashTable :files="data?.files" />
    </template>
  </UDashboardPanel>
</template>
