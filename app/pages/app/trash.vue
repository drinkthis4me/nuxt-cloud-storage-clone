<script setup lang="ts">
import type { SerializedFile } from '#shared/types/response/files'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const {
  files,
  isPending,
  refresh,
  patchFile,
} = useTrashBinContents()

function handleFileUpdated(updated: SerializedFile) {
  patchFile([updated.id], updated)
}
function handleFileDeleted(fileIds: string[]) {
  patchFile(fileIds, null)
}

const init = ref(true)
watch(isPending, (val) => {
  if (val) init.value = true
}, { once: true })
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
      <HeroLoading v-if="isPending && init" />
      <HeroEmpty
        v-else-if="files.length === 0"
        icon="i-lucide-trash-2"
        title="Trash bin is empty"
      />
      <FileTrashTable
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
