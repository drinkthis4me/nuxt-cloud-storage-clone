<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed: boolean
}>()

const { promptAndCreateFolder } = useCreateFolder()
const { promptAndUploadFile } = useUploadFile()

const dropdownMenuItems = ref<DropdownMenuItem[]>([
  {
    label: 'New folder',
    icon: 'i-lucide-folder',
    onSelect() {
      promptAndCreateFolder()
    },
    class: 'cursor-pointer',
  },
  {
    label: 'New File',
    icon: 'i-lucide-file',
    onSelect() {
      promptAndUploadFile()
    },
    class: 'cursor-pointer',
  },
])
</script>

<template>
  <UDropdownMenu
    :items="dropdownMenuItems"
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      variant="soft"
      icon="i-lucide-plus"
      :label="collapsed ? undefined :'New'"
      size="xl"
      class="w-60"
    />
  </UDropdownMenu>
</template>
