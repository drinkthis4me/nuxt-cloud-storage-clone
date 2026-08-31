<script lang="ts">
import type { ShareLinkSchema } from '~~/shared/schemas/shareLink'
import type { SelectItem, FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { shareLinkSchema, sharePermission } from '~~/shared/schemas/shareLink'

const props = defineProps<{
  fileName: string
  linkSettings: ShareLinkSchema
}>()

const emit = defineEmits<{
  close: [value: ShareLinkSchema | null]
}>()

const state = reactive({
  permission: props.linkSettings.permission,
  password: props.linkSettings.password ?? undefined,
  expiresAt: props.linkSettings.expiresAt ?? undefined,
})

const permissionSelectItems = [
  {
    value: sharePermission.VIEW,
    label: 'Can view',
    icon: 'i-lucide-eye',
  },
  {
    value: sharePermission.EDIT,
    label: 'Can edit',
    icon: 'i-lucide-pen',
  },
] satisfies SelectItem[]

async function onSubmit(e: FormSubmitEvent<ShareLinkSchema>) {
  emit('close', e.data)
}

const formRef = useTemplateRef('form')
</script>

<template>
  <UModal
    :ui="{
      footer: 'justify-end',
    }"
    scrollable
    :close="{ onClick: () => emit('close', null) }"
  >
    <template #header>
      <div>
        <h2 class="text-2xl capitalize">
          Link Settings
        </h2>
        <p class="text-sm text-dimmed">
          {{ fileName }}
        </p>
      </div>
    </template>

    <template #body>
      <UForm
        ref="form"
        :schema="shareLinkSchema"
        :state="state"
        class="flex flex-col space-y-4"
        @submit.prevent="onSubmit"
        @error="(e) => console.log(e)"
      >
        <UFormField
          label="Permission"
          name="permission"
        >
          <USelect
            v-model="state.permission"
            :items="permissionSelectItems"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Password (Optional)"
          name="password"
        >
          <UInput
            v-model="state.password"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Expiration date (Optional)"
          name="expiresAt"
        >
          <AppDatepicker
            v-model:date="state.expiresAt"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <button
          type="submit"
          class="hidden"
        />
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Save"
        size="xl"
        @click="formRef?.submit()"
      />
    </template>
  </UModal>
</template>
