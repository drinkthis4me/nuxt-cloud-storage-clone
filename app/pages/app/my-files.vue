<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
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
      <FileTable />
    </template>
  </UDashboardPanel>
</template>
