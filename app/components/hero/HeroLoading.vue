<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  message?: string
}>()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
    <UIcon
      :name="icon ?? 'i-lucide-loader-circle'"
      class="size-16 text-muted animate-spin"
    />
    <div>
      <p class="text-2xl font-medium">
        {{ title ?? 'Loading...' }}
      </p>
    </div>
  </div>
</template>
