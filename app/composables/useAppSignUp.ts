import { userCreateSchema } from '~~/shared/schemas/user'

import type { UserCreateSchema } from '~~/shared/schemas/user'

export const useAppSignUp = () => {
  const form = reactive<Partial<UserCreateSchema>>({
    email: '',
    password: '',
  })
  const isLoading = shallowRef(false)

  const { fetch: fetchSession } = useUserSession()
  const toast = useToast()
  const authStore = useAuthStore()

  const signup = async (body: UserCreateSchema) => {
    isLoading.value = true

    try {
      const validBody = userCreateSchema.parse(body)

      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: validBody,
      })

      console.log(res)

      authStore.user = res
      await fetchSession()
      await navigateTo('/app')
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Sign up failed. Try again later.',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    form,
    isLoading,
    signup,
  }
}
