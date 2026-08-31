<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const {
  files,
  isPending,
  isFirstPending,
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
          <h1 class="capitalize">
            Recent files
          </h1>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroLoading v-if="isPending && isFirstPending" />

      <HeroEmpty v-else-if="files.length === 0" />

      <HeroError v-else-if="error" />

      <FileRecentTable
        v-else
        :files
        :loading="isPending"
        class="flex-1"
        @refresh="refresh"
        @file-deleted="handleFileDeleted"
      />
    </template>
  </UDashboardPanel>
</template>
