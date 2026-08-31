<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarCollapsed = shallowRef(false)

const { toggle: toggleColorMode } = useAppColorMode()

const links = [
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/app',
    },
    {
      label: 'My files',
      icon: 'i-lucide-folder',
      to: '/app/folders',
    },
    // {
    //   label: 'Favorite',
    //   icon: 'i-lucide-star',
    //   to: '/app/favorite',
    // },
    {
      label: 'Shared By Me',
      icon: 'i-lucide-link',
      to: '/app/shared-by-me',
    },
    {
      label: 'Shared with Me',
      icon: 'i-lucide-user-plus',
      to: '/app/shared-with-me',
    },
    {
      label: 'Upload Progress',
      icon: 'i-lucide-circle-fading-arrow-up',
      to: '/app/uploading',
    },
    {
      label: 'Trash bin',
      icon: 'i-lucide-trash',
      to: '/app/trash',
    },
  ],
  [
    {
      label: 'Color Mode',
      icon: 'i-lucide-sun-moon',
      onSelect: () => {
        toggleColorMode()
      },
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      onSelect: () => {
        sidebarCollapsed.value = true
      },
    },
  ],
] satisfies NavigationMenuItem[][]
</script>

<template>
  <UApp class="h-screen flex flex-col overflow-hidden">
    <AppHeader class="shrink-0" />

    <div class="flex flex-1">
      <UDashboardGroup
        unit="px"
        :ui="{
          base: 'static flex-1',
        }"
      >
        <UDashboardSidebar
          id="default"
          v-model:collapsed="sidebarCollapsed"
          collapsible
          resizable
          :min-size="200"
          :default-size="280"
          :max-size="600"
          class="bg-elevated/25"
          :ui="{
            header: sidebarCollapsed ? 'justify-center' : '',
            footer: 'lg:border-t lg:border-default',
          }"
        >
          <template #header>
            <UDashboardSidebarCollapse />
          </template>

          <template #default="{ collapsed }">
            <FileCreateNewButton :collapsed />

            <UNavigationMenu
              :collapsed="collapsed"
              :items="links[0]"
              orientation="vertical"
              tooltip
              popover
            />

            <StorageUsage v-show="!collapsed" />

            <UNavigationMenu
              :collapsed="collapsed"
              :items="links[1]"
              orientation="vertical"
              tooltip
              class=""
            />
          </template>
        </UDashboardSidebar>

        <slot />
      </UDashboardGroup>
    </div>
  </UApp>
</template>
