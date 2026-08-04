<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed: boolean
}>()

const { open: openDialog, create: createFolder } = useDialogCreateFolder()

const handleFolderCreation = async () => {
  const res = await openDialog()

  if (res) {
    console.log('New folder name', res)
    createFolder({
      name: res,
      isFolder: true,
    })
  }
}

const dropdownMenuItems = ref<DropdownMenuItem[]>([
  {
    label: 'New folder',
    icon: 'i-lucide-folder',
    onSelect() {
      handleFolderCreation()
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
