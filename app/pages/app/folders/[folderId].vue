<script setup lang="ts">
import type { SerializedFile } from '#shared/types/response/files'

definePageMeta({
  key: 'folder-view',
  layout: 'dashboard',
  middleware: ['auth', 'folder-id'],
})

const route = useRoute()
const folderId = computed(() => route.params.folderId as string)

const {
  files,
  isPending,
  refresh,
  patchFile,
} = useFolderContents(folderId)

const { breadcrumbs, isRefreshing } = useBreadcrumbs(folderId)

const handleRenamed = (updated: SerializedFile) => {
  patchFile(updated.id, updated)
}
</script>

<template>
  <UDashboardPanel id="folder-content">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <FileBreadcrumb
            :breadcrumbs
            :is-refreshing="isRefreshing"
          />
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <FileTable
        :files
        :loading="isPending"
        @moved="refresh"
        @renamed="handleRenamed"
      />
    </template>
  </UDashboardPanel>
</template>
