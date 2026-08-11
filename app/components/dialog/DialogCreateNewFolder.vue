<script lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FolderSchema } from '#shared/schemas/file'
</script>

<script setup lang="ts">
import { folderSchema } from '#shared/schemas/file'

const emit = defineEmits<{
  close: [value: string | null]
}>()

const formRef = useTemplateRef('form')

const form = reactive<Partial<FolderSchema>>({
  name: 'Unnamed New Folder',
  isFolder: true,
  parentFolderId: null,
})

function onSubmit(e: FormSubmitEvent<FolderSchema>) {
  emit('close', e.data.name)
}
</script>

<template>
  <UModal
    :ui="{
      title: 'text-2xl',
      footer: 'justify-end',
    }"
    :close="{ onClick: () => emit('close', null) }"
    title="New folder"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="folderSchema"
        :state="form"
        class=""
        @submit.prevent="onSubmit"
      >
        <UFormField name="file-name">
          <UInput
            id="file-name"
            v-model.trim="form.name"
            size="2xl"
            autofocus
            class="w-full"
          />
        </UFormField>

        <button
          type="submit"
          class="hidden"
        >
          submit
        </button>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          label="Cancel"
          size="lg"
          @click="emit('close', null)"
        />
        <UButton
          label="Create"
          size="lg"
          @click="formRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>
