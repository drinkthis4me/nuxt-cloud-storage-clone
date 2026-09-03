<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Scroll to home page elements
// See: '/app/pages/index.vue'
function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const menuItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Features',
    onSelect() {
      scrollTo('#features')
    },
    class: 'cursor-pointer',
  },
  {
    label: 'Pricing',
    onSelect() {
      scrollTo('#pricing')
    },
    class: 'cursor-pointer',
  },
  {
    label: 'Security',
    onSelect() {
      scrollTo('#security')
    },
    class: 'cursor-pointer',
  },
])
</script>

<template>
  <UHeader
    :toggle="{
      size: 'xl',
    }"
    :ui="{
      root: 'bg-default/75 backdrop-blur border-b border-default h-(--ui-header-height) z-50 py-5',
    }"
  >
    <template #title>
      <AppLogo />
    </template>

    <UNavigationMenu :items="menuItems" />

    <template #right>
      <div class="hidden md:flex gap-4 px-4">
        <HomeLogInOutButton />
        <HomeHeaderCTAButton />
      </div>
    </template>

    <template #body>
      <UNavigationMenu
        :items="menuItems"
        orientation="vertical"
        class="-mx-2.5"
      />

      <HomeHeaderCTAButton
        block
        class="mt-5"
      />

      <HomeLogInOutButton class="mt-5" />
    </template>
  </UHeader>
</template>
