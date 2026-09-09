<script lang="ts">
import type { UserLoginSchema } from '~~/shared/schemas/user'
import type { FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { userLoginSchema } from '~~/shared/schemas/user'

const {
  form,
  isLoading,
  login,
} = useAppLogIn()

async function onSubmit(e: FormSubmitEvent<UserLoginSchema>) {
  await login(e.data)
}
</script>

<template>
  <div class="p-10 w-screen md:w-xl border border-accented rounded-xl bg-white dark:bg-neutral-900">
    <h1 class="text-3xl">
      Sign in
    </h1>
    <div class="py-4">
      New to FolderSpace?
      <NuxtLink
        to="/signup"
        class="ml-2 text-primary"
      >
        Sign up
      </NuxtLink>
    </div>
    <UForm
      :schema="userLoginSchema"
      :state="form"
      class=""
      @submit.prevent="onSubmit"
    >
      <div class="grid gap-4">
        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="form.email"
            size="2xl"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
        >
          <UInput
            v-model="form.password"
            size="2xl"
            type="password"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        block
        type="submit"
        :loading="isLoading"
        class="mt-4 capitalize"
      >
        Sign in
      </UButton>
    </UForm>
  </div>
</template>
