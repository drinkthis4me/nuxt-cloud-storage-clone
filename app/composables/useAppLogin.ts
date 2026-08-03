import { userLoginSchema } from '#shared/schemas/user'

import type { UserLoginSchema } from '#shared/schemas/user'

export const useAppLogIn = () => {
  const form = reactive<UserLoginSchema>({
    email: '',
    password: '',
  })
  const isLoading = shallowRef(false)

  const { fetch: fetchSession } = useUserSession()
  const toast = useToast()

  const login = async (body: UserLoginSchema) => {
    isLoading.value = true
    try {
      const validBody = userLoginSchema.parse(body)

      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: validBody,
      })

      console.log(res)

      fetchSession()
      navigateTo('/app')
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Wrong email or password',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    form,
    isLoading,
    login,
  }
}
