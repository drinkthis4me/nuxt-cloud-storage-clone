<script setup lang="ts">
import type { SerializedFile } from '#shared/types/response/files'

definePageMeta({
  key: 'folder-view',
  layout: 'dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const folderId = computed(() => (route.params.folderId as string) || null)

const {
  files,
  isPending,
  refresh,
  patchFile,
} = useFolderContents(folderId)

const {
  breadcrumbs,
  isRefreshing,
  error: breadcrumbsError,
} = useBreadcrumbs(folderId)

const notFound = computed(() => folderId.value !== null && !!breadcrumbsError.value)

function handleFileUpdated(updated: SerializedFile) {
  patchFile([updated.id], updated)
}
function handleFileDeleted(fileIds: string[]) {
  patchFile(fileIds, null)
}
</script>

<template>
  <UDashboardPanel id="folder-content">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <h1>My files</h1>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <FileBreadcrumb
        v-if="!notFound"
        :breadcrumbs
        :is-refreshing="isRefreshing"
        class="px-2"
      />
      <HeroNotFound v-if="notFound" />
      <FileTable
        v-else
        :files
        :loading="isPending"
        @refresh="refresh"
        @file-updated="handleFileUpdated"
        @file-deleted="handleFileDeleted"
      />
    </template>
  </UDashboardPanel>
</template>
