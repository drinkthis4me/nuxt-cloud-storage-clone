<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
}>()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
    <UIcon
      :name="icon ?? 'i-lucide-file-search'"
      class="size-16 text-muted"
    />
    <div>
      <p class="text-2xl font-medium">
        {{ title ?? 'No files.' }}
      </p>

      <div
        v-if="$slots.default"
        class="mt-4"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
