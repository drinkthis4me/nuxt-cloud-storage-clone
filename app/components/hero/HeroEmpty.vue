<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  hideButton?: boolean
}>()

const { promptAndUploadFile } = useUploadFile()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
    <UIcon
      :name="icon ?? 'i-lucide-file-search'"
      class="size-16 text-muted"
    />
    <div class="space-y-4">
      <p class="text-2xl font-medium">
        {{ title ?? 'No files. What are you waiting for?' }}
      </p>

      <slot>
        <UButton
          v-if="!hideButton"
          label="Upload now"
          size="xl"
          class="capitalize"
          @click="promptAndUploadFile"
        />
      </slot>
    </div>
  </div>
</template>
