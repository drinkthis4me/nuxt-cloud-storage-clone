<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  user: {
    id: number
    name: string | null
    email: string
  }
}>()

const { logout } = useAppLogOut()

const items = ref<DropdownMenuItem[]>([
  {
    label: 'Sign out',
    icon: 'i-lucide-arrow-big-right-dash',
    onSelect() {
      logout()
    },
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
  },
])
</script>

<template>
  <div>
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'start',
        side: 'bottom',
        sideOffset: 12,
      }"
      :ui="{
        content: 'w-48',
      }"
    >
      <UTooltip
        :ui="{
          content: 'h-12 text-base',
        }"
        :delay-duration="500"
      >
        <UAvatar
          src="https://i.pravatar.cc/300"
          loading="lazy"
        />

        <template #content>
          <div class="flex flex-col justify-center">
            <p v-if="user && user.name">
              {{ user.name }}
            </p>
            <p>{{ user.email }}</p>
          </div>
        </template>
      </UTooltip>
    </UDropdownMenu>
  </div>
</template>
