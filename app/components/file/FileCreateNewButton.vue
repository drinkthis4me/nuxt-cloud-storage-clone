<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const { promptAndCreateFolder } = useCreateFolder()
const { promptAndUploadFile } = useUploadFile()

function getParentFolderId(): string | null {
  // '/app/folders/:folderId'
  const folderId = route.params.folderId
  return typeof folderId === 'string' ? folderId : null
}

const dropdownMenuItems = ref<DropdownMenuItem[]>([
  {
    label: 'New folder',
    icon: 'i-lucide-folder',
    onSelect() {
      const parentFolderId = getParentFolderId()
      promptAndCreateFolder(parentFolderId)
    },
    class: 'cursor-pointer',
  },
  {
    label: 'New File',
    icon: 'i-lucide-file',
    onSelect() {
      const parentFolderId = getParentFolderId()
      promptAndUploadFile(parentFolderId)
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
      variant="subtle"
      icon="i-lucide-plus"
      :label="collapsed ? undefined :'New'"
      size="xl"
      block
    />
  </UDropdownMenu>
</template>
