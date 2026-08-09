<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

// TODO: Recent/Suggest files
</script>

<template>
  <UDashboardPanel id="index">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          Welcome
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      app
    </template>
  </UDashboardPanel>
</template>
