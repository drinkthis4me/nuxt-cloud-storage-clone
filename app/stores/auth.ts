export const useAuthStore = defineStore('auth', () => {
  const isLoading = shallowRef(false)

  const {
    ready,
    loggedIn,
    user,
    fetch: fetchSession,
    clear: clearSession,
  } = useUserSession()

  const toast = useToast()

  const logout = async () => {
    isLoading.value = true
    try {
      if (!ready) fetchSession()

      if (!loggedIn) return

      reset()
      clearSession()
      navigateTo('/')
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Something went wrong',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  const reset = () => {
  }

  return {
    isLoading,
    user,
    loggedIn,
    fetchSession,
    logout,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
