<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <UButton
    v-if="authStore.loggedIn"
    color="primary"
    variant="ghost"
    block
    :loading="authStore.isLoading"
    @click="authStore.logout"
  >
    Sign out
  </UButton>

  <UButton
    v-else
    color="primary"
    variant="ghost"
    block
    to="/login"
  >
    Sign In
  </UButton>
</template>
