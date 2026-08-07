import type { User } from '#shared/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = shallowRef<User>({
    id: -1,
    name: '',
    email: '',
  })

  const reset = () => {
    user.value = {
      id: -1,
      name: '',
      email: '',
    }
  }

  return {
    user,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
