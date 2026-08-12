<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const {
  files,
  isPending,
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
          <h1>Recent files</h1>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isPending" />
      <FileRecentTable
        v-else
        :files
        :loading="isPending"
        @refresh="refresh"
        @file-deleted="handleFileDeleted"
      />
    </template>
  </UDashboardPanel>
</template>
