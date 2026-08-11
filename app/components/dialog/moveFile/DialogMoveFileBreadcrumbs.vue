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

const emit = defineEmits<{
  'change-folder': [value: string | null]
}>()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  {
    label: 'My Files',
    icon: 'i-lucide-folder',
    class: 'cursor-pointer',
    onClick() {
      emit('change-folder', null)
    },
  },
  ...breadcrumbs.map(b => ({
    label: b.name,
    class: 'cursor-pointer',
    onClick() {
      emit('change-folder', b.id)
    },
  })),
])
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'opacity-60': isRefreshing }"
  >
    <UBreadcrumb :items="breadcrumbItems" />
    <Icon
      v-if="isRefreshing"
      name="i-lucide-loader-circle"
      class="ml-4 animate-spin text-muted"
    />
  </div>
</template>
