import { userLoginSchema } from '#shared/schemas/user'

import type { UserLoginSchema } from '#shared/schemas/user'

export const useAppLogin = () => {
  const form = reactive<UserLoginSchema>({
    email: '',
    password: '',
  })

  const login = async () => {
    const validBody = userLoginSchema.parse(form)

    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: validBody,
    })

    console.log(res)
  }

  return {
    form,
    login,
  }
}
