<script setup lang="ts">
import { unlockShareLinkSchema } from '#shared/schemas/shareLink'

import type { UnlockShareLinkSchema } from '#shared/schemas/shareLink'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  token: string
}>()

const emit = defineEmits<{
  unlocked: []
}>()

const state = reactive<UnlockShareLinkSchema>({
  password: '',
})

const { loading, unlock } = useUnlockLink()

async function onSubmit(e: FormSubmitEvent<UnlockShareLinkSchema>) {
  const password = e.data.password

  const success = await unlock(props.token, password)
  if (success) {
    emit('unlocked')
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <h2 class="text-2xl">
      This link is password protected.
    </h2>
    <UForm
      :state
      :schema="unlockShareLinkSchema"
      class="flex flex-col gap-4 p-8"
      @submit="onSubmit"
    >
      <UFormField
        label="Please enter password to continue"
        name="password"
      >
        <UInput
          v-model="state.password"
          size="xl"
          type="password"
          :disabled="loading"
        />
      </UFormField>

      <UButton
        label="Submit"
        type="submit"
        block
        :loading
        size="xl"
      />
    </UForm>
  </div>
</template>
