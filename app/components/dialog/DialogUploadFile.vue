<script lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { z } from 'zod'

const emit = defineEmits<{
  close: [value: File | null]
}>()

const formRef = useTemplateRef('form')

const schema = z.object({
  file: z.file('Required. Please select or drag a file.'),
})

type Schema = z.output<typeof schema>

const form = reactive<Partial<Schema>>({
  file: undefined,
})

function onSubmit(e: FormSubmitEvent<Schema>) {
  console.log('onSubmit')
  emit('close', e.data.file)
}
</script>

<template>
  <UModal
    :ui="{
      title: 'text-2xl',
      footer: 'justify-end',
    }"
    :close="{ onClick: () => emit('close', null) }"
    title="New file"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="schema"
        :state="form"
        class="flex justify-center"
        @submit.prevent="onSubmit"
      >
        <div class="px-4 flex flex-col justify-center items-center space-y-4">
          <UFormField name="file-upload">
            <UFileUpload
              id="file-upload"
              v-model="form.file"
              :multiple="false"
              size="xl"
              description=" (max. 500MB)"
              class="w-48 md:w-96 min-h-48 "
              :class="{ 'cursor-pointer': !form.file }"
            >
              <template #label>
                <div class="">
                  <p>Click to select</p>
                  <p>or drop your file here</p>
                </div>
              </template>
            </UFileUpload>
          </UFormField>

          <div
            v-if="form.file"
            class="text-center text-balance break-all"
          >
            {{ form.file.name }}
          </div>
        </div>

        <button
          type="submit"
          class="hidden"
        >
          Upload
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
          label="Upload"
          size="lg"
          @click="formRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>
