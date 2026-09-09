<script setup lang="ts">
import type { SerializedFile } from '#shared/types/response/files'

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
} = useTrashBinContents()

function handleFileUpdated(updated: SerializedFile) {
  patchFile([updated.id], updated)
}
function handleFileDeleted(fileIds: string[]) {
  patchFile(fileIds, null)
}
</script>

<template>
  <UDashboardPanel id="trash">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="text-base capitalize">
            Trash bin
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isFirstLoading" />

      <HeroError v-else-if="error" />

      <HeroEmpty
        v-else-if="files.length === 0"
        icon="i-lucide-trash-2"
        title="Trash bin is empty"
        hide-button
      />

      <ClientOnly v-else>
        <TableTrashBin
          :files
          :loading="isRefreshing"
          @refresh="refresh"
          @file-updated="handleFileUpdated"
          @file-deleted="handleFileDeleted"
        />
        <template #fallback>
          <TableSkeleton />
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
