<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
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
      <FileTrashTable />
    </template>
  </UDashboardPanel>
</template>
