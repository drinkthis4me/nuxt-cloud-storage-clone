<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const authStore = useAuthStore()

const items = ref<DropdownMenuItem[]>([
  {
    label: 'Sign out',
    icon: 'i-lucide-arrow-big-right-dash',
    onSelect() {
      authStore.logout()
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
      v-if="authStore.loggedIn && authStore.user"
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
          size="3xl"
        />

        <template #content>
          <div class="flex flex-col justify-center">
            <p v-if="authStore.user.name">
              {{ authStore.user.name }}
            </p>
            <p>{{ authStore.user.email }}</p>
          </div>
        </template>
      </UTooltip>
    </UDropdownMenu>

    <USkeleton
      v-else
      class="size-12 rounded-full"
    />
  </div>
</template>
