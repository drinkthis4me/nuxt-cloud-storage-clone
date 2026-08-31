<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
}>()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
    <UIcon
      :name="icon ?? 'i-lucide-file-x'"
      class="size-16 text-muted"
    />
    <div class="space-y-4">
      <p class="text-2xl font-medium">
        {{ title ?? 'Unexpected error occurred.' }}
      </p>

      <slot>
        <UButton
          label="Back to home"
          size="xl"
          class="capitalize"
          @click="navigateTo('/')"
        />
      </slot>
    </div>
  </div>
</template>
