<script setup lang="ts">
import { useAppLogOut } from '~/composables/useAppLogOut'

defineProps<{
  loggedIn: boolean
}>()

const { logout, isLoading } = useAppLogOut()
</script>

<template>
  <UButton
    v-if="loggedIn"
    color="primary"
    variant="ghost"
    block
    :loading="isLoading"
    @click="logout"
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
