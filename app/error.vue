<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()
</script>

<template>
  <UApp>
    <AppSimpleHeader />

    <UError :error="error" />
  </UApp>
</template>
