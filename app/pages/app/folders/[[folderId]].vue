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
  isFirstLoading,
  isRefreshing,
  error: folderContentError,
  refresh,
  patchFile,
} = useFolderContents(folderId)

const {
  breadcrumbs,
  isPending: isBreadcrumbsPending,
  error,
} = useBreadcrumbs(folderId)

const noFileEntry = computed(() => folderId.value === null && files.value.length === 0)

function handleFileUpdated(updated: SerializedFile) {
  patchFile([updated.id], updated)
}
function handleFileDeleted(fileIds: string[]) {
  patchFile(fileIds, null)
}

watch(error, (val) => {
  if (val) {
    throw createError({
      fatal: true,
      status: 404,
      statusText: 'Folder/File Not found',
      cause: val,
    })
  }
})
</script>

<template>
  <UDashboardPanel id="folder-content">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="text-base capitalize">
            My files
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isFirstLoading" />

      <HeroError v-else-if="folderContentError" />

      <HeroEmpty v-else-if="noFileEntry" />

      <template v-else>
        <ClientOnly>
          <FileBreadcrumb
            :breadcrumbs
            :is-refreshing="isBreadcrumbsPending"
            class="px-2"
          />
          <template #fallback>
            <FileBreadcrumbSkeleton />
          </template>
        </ClientOnly>

        <ClientOnly>
          <TableMyFiles
            :files
            :loading="isRefreshing"
            class="flex-1"
            @refresh="refresh"
            @file-updated="handleFileUpdated"
            @file-deleted="handleFileDeleted"
          />
          <template #fallback>
            <TableSkeleton />
          </template>
        </ClientOnly>
      </template>
    </template>
  </UDashboardPanel>
</template>
