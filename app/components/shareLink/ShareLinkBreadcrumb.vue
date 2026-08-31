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

const route = useRoute()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Shared folder',
    icon: 'i-lucide-folder',
    to: {
      path: route.path,
    },
  },
  ...breadcrumbs.map(b => ({
    label: b.name,
    to: {
      path: route.path,
      query: {
        folder: b.id,
      },
    },
  })),
])
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'opacity-60': isRefreshing }"
  >
    <UBreadcrumb
      :items="breadcrumbItems"
      class="px-4 py-2 border-1 border-accented rounded-xl"
    />
    <Icon
      v-if="isRefreshing"
      name="i-lucide-loader-circle"
      class="ml-4 animate-spin text-dimmed"
    />
  </div>
</template>
