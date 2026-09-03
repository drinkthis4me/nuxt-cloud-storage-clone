<script setup lang="ts">
const {
  block = false,
} = defineProps<{
  block?: boolean
}>()

const authStore = useAuthStore()
</script>

<template>
  <UButton
    v-if="!authStore.loggedIn"
    color="primary"
    variant="solid"
    :block
    to="/signup"
  >
    <span class="flex items-center text-nowrap">Get started</span>
  </UButton>
  <UButton
    v-else
    color="primary"
    variant="solid"
    :block
    to="/app"
  >
    Dashboard
  </UButton>
</template>
