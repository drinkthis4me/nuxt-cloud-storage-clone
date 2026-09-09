<script lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { z } from 'zod'
import { name as nameSchema } from '#shared/schemas/file'

const props = defineProps<{
  name: string
}>()

const emit = defineEmits<{
  close: [value: string | null]
}>()

const formRef = useTemplateRef('formEl')

const schema = z.object({
  name: nameSchema,
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: props.name,
})

function onSubmit(e: FormSubmitEvent<Schema>) {
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
    title="Rename"
  >
    <template #body>
      <UForm
        ref="formEl"
        :schema="schema"
        :state="state"
        class=""
        @submit.prevent="onSubmit"
      >
        <UFormField name="file-name">
          <UInput
            id="file-name"
            v-model.trim="state.name"
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
          label="Submit"
          size="lg"
          type="button"
          @click="formRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>
