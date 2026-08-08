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
