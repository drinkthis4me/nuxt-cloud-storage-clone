<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
    :ui="{
      footer: 'justify-end',
    }"
    :close="{ onClick: () => emit('close', false) }"
    title="Delete Link?"
    description="This link will not work for anyone anymore."
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton
          label="Delete"
          @click="emit('close', true)"
        />
        <UButton
          color="neutral"
          variant="outline"
          label="Cancel"
          @click="emit('close', false)"
        />
      </div>
    </template>
  </UModal>
</template>
