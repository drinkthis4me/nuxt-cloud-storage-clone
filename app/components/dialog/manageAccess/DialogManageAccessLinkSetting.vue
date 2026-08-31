<script lang="ts">
import type { SharePermissionEnum } from '#shared/types/response/shareLink'
import type { EditShareLinkSchema } from '~~/shared/schemas/shareLink'
import type { SelectItem, RadioGroupItem, FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { z } from 'zod'
import { sharePermission } from '~~/shared/schemas/shareLink'

const props = defineProps<{
  permission: SharePermissionEnum
  hasPassword: boolean
  expiresAt: string | null
}>()

const emit = defineEmits<{
  close: [value: EditShareLinkSchema | null]
}>()

type PasswordMode = 'keep' | 'change' | 'remove'

const mode = ref<PasswordMode>(props.hasPassword ? 'keep' : 'remove')

const newPassword = z.string().optional()
  .superRefine((val, ctx) => {
    // Only validate when changing password
    if (mode.value === 'change' && typeof val === 'string') {
      if (val.length < 4) {
        ctx.addIssue({
          code: 'too_small',
          minimum: 4,
          origin: 'string',
          inclusive: true,
          message: 'Password must be at least 4 characters',
          input: val,
        })
      }
      else if (val.length > 100) {
        ctx.addIssue({
          code: 'too_big',
          maximum: 100,
          origin: 'string',
          inclusive: true,
          message: 'Password must be at most 100 characters',
          input: val,
        })
      }
    }
  })
const schema = z.object({
  permission: z.enum(Object.values(sharePermission)),
  password: newPassword,
  expiresAt: z.iso.datetime().nullable().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  permission: props.permission,
  newPassword: '',
  expiresAt: props.expiresAt ?? undefined,
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

const radioGroupHasPasswordItems = [
  {
    value: 'keep',
    label: 'Keep existing password',
  },
  {
    value: 'change',
    label: 'Change password',
  },
  {
    value: 'remove',
    label: 'Remove password',
  },
] satisfies RadioGroupItem[]

const radioGroupNoPasswordItems = [
  {
    value: 'remove',
    label: 'No password',
  },
  {
    value: 'change',
    label: 'Set a password',
  },
] satisfies RadioGroupItem[]

async function onSubmit(e: FormSubmitEvent<Schema>) {
  let finalPassword: string | null | undefined = undefined

  if (mode.value === 'change') {
    finalPassword = state.newPassword // Send the new string
  }
  else if (mode.value === 'remove') {
    finalPassword = null // Send null to clear the password
  }
  else {
    finalPassword = undefined // 'keep' -> omit/leave unchanged
  }

  const payload = {
    permission: e.data.permission,
    ...(finalPassword !== undefined && { password: finalPassword }),
    ...(e.data.expiresAt !== undefined && { expiresAt: e.data.expiresAt }),
  } satisfies EditShareLinkSchema

  emit('close', payload)
}
</script>

<template>
  <UModal
    title="Edit link settings"
    :close="{ onClick: () => emit('close', null) }"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col space-y-4"
        @submit="onSubmit"
        @error="(errors) => console.log('Validation Errors:', errors)"
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

        <UFormField label="Password Protection">
          <div class="flex flex-col gap-2">
            <template v-if="hasPassword">
              <div class="text-sm text-muted">
                This link is currently password protected.
              </div>
              <URadioGroup
                v-model="mode"
                :items="radioGroupHasPasswordItems"
                orientation="horizontal"
              />
            </template>

            <template v-else>
              <URadioGroup
                v-model="mode"
                :items="radioGroupNoPasswordItems"
                orientation="horizontal"
              />
            </template>
          </div>
        </UFormField>

        <UFormField
          v-if="mode === 'change'"
          label="New password"
          name="newPassword"
        >
          <UInput
            v-model="state.newPassword"
            type="password"
            size="lg"
            class="w-full"
            placeholder="Enter new password"
          />
        </UFormField>

        <UFormField
          label="Expiration date"
          name="expiresAt"
        >
          <AppDatepicker
            v-model:date="state.expiresAt"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end items-center gap-2">
          <UButton
            label="Apply"
            type="submit"
            size="lg"
          />
          <UButton
            label="Cancel"
            variant="outline"
            type="button"
            color="neutral"
            size="lg"
            @click="emit('close', null)"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
