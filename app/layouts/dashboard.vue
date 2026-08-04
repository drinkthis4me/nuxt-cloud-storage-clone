<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarCollapsed = shallowRef(false)

const { toggle: toggleColorMode } = useAppColorMode()

const links = [
  [
    {
      label: 'My files',
      icon: 'i-lucide-folder',
      to: '/app/my-files',
    },
    {
      label: 'Favorite',
      icon: 'i-lucide-star',
      to: '/app',
    },
    {
      label: 'Recent',
      icon: 'i-lucide-clock',
      to: '/app',
    },
    {
      label: 'Shared',
      icon: 'i-lucide-link',
      to: '/app',
    },
    {
      label: 'Shared with me',
      icon: 'i-lucide-users',
      to: '/app',
    },
    {
      label: 'Trash',
      icon: 'i-lucide-trash',
      to: '/app',
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
      to: '/app',
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
          <template #header="{ collapsed }">
            <UButton
              variant="soft"
              icon="i-lucide-plus"
              :label="collapsed ? undefined :'New'"
              block
            />
          </template>

          <template #default="{ collapsed }">
            <UNavigationMenu
              :collapsed="collapsed"
              :items="links[0]"
              orientation="vertical"
              tooltip
              popover
            />

            <div
              v-show="!collapsed"
              class="mt-auto p-4"
            >
              <StorageUsage />
            </div>

            <UNavigationMenu
              :collapsed="collapsed"
              :items="links[1]"
              orientation="vertical"
              tooltip
              class="mt-auto"
            />
          </template>
        </UDashboardSidebar>

        <slot />
      </UDashboardGroup>
    </div>
  </UApp>
</template>
