<script setup lang="ts">
const input = shallowRef('')

// TODO: wrap in form
</script>

<template>
  <div>
    <UInput
      v-model="input"
      icon="i-lucide-search"
      variant="subtle"
      size="2xl"
      placeholder="Search files"
      class="w-full"
    />
  </div>
</template>
