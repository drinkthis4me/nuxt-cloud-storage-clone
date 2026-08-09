<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
    <UIcon
      name="i-lucide-folder-x"
      class="size-16 text-muted"
    />
    <div>
      <p class="text-2xl font-medium">
        {{ title ?? 'Folder not found' }}
      </p>
      <p class="text-base text-muted mt-1">
        {{ message ?? "This folder doesn't exist, or you don't have access to it." }}
      </p>
    </div>
    <UButton
      to="/app/folders"
      label="Back to My Files"
      variant="soft"
      size="lg"
    />
  </div>
</template>
