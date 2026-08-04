<script lang="ts">
import type { UserCreateSchema } from '~~/shared/schemas/user'
import type { FormSubmitEvent } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { userCreateSchema } from '~~/shared/schemas/user'

const showPassword = shallowRef(false)

const {
  form,
  isLoading,
  signup,
} = useAppSignUp()

async function onSubmit(e: FormSubmitEvent<UserCreateSchema>) {
  await signup(e.data)
}
</script>

<template>
  <div class="p-10 border border-accented rounded-xl bg-white dark:bg-neutral-900">
    <h1 class="text-3xl">
      Sign Up
    </h1>
    <div class="py-4">
      Already have FolderSpace account ?
      <NuxtLink
        to="/login"
        class="ml-2 text-primary"
      >
        Sign in
      </NuxtLink>
    </div>
    <UForm
      :schema="userCreateSchema"
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
            :type="showPassword ? 'text' : 'password'"
            :disabled="isLoading"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                aria-controls="password"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>
      </div>

      <UButton
        block
        type="submit"
        :loading="isLoading"
        class="mt-4 capitalize"
      >
        Sign up
      </UButton>
    </UForm>

    <div class="mt-5">
      <p class="text-neutral-500">
        By clicking on sign up button, you agree to FolderSpace's <NuxtLink class="underline">terms of services</NuxtLink>.
      </p>
    </div>
  </div>
</template>
