<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const breadcrumbItems = ref<BreadcrumbItem[]>([
  {
    label: 'My Files',
    icon: 'i-lucide-folder',
    to: '/app/my-files',
  },
])
</script>

<template>
  <UBreadcrumb
    :items="breadcrumbItems"
    color="secondary"
  />
</template>
