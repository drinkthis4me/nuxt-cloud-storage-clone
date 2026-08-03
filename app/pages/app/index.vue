<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
</script>

<template>
  <UDashboardPanel id="overview">
    <template #header>
      <UDashboardNavbar title="Overview">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="">
        app overview
      </div>
    </template>
  </UDashboardPanel>
</template>
