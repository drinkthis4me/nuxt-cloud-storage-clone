<script setup lang="ts">
const {
  loggedIn,
  block = false,
} = defineProps<{
  loggedIn: boolean
  block?: boolean
}>()
</script>

<template>
  <UButton
    v-if="!loggedIn"
    color="primary"
    variant="solid"
    :block
    to="/signup"
  >
    Get <span class="font-bold font-serif">FolderSpace</span>
  </UButton>
  <UButton
    v-else
    color="primary"
    variant="solid"
    :block
    to="/app"
  >
    To <span class="font-bold font-serif">FolderSpace</span>
  </UButton>
</template>
