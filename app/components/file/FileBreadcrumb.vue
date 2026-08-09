<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'

const {
  breadcrumbs,
  isRefreshing = false,
} = defineProps<{
  breadcrumbs: SerializedFile[]
  isRefreshing?: boolean
}>()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  {
    label: 'My Files',
    icon: 'i-lucide-folder',
    to: '/app/folders',
  },
  ...breadcrumbs.map(b => ({
    label: b.name,
    to: `/app/folders/${b.id}`,
  })),
])
</script>

<template>
  <div :class="{ 'opacity-60': isRefreshing }">
    <UBreadcrumb
      :items="breadcrumbItems"
      color="secondary"
    />
  </div>
</template>
