export const useAppLogOut = () => {
  const isLoading = ref(false)
  const {
    ready,
    loggedIn,
    fetch: fetchSession,
    user,
    clear: clearSession,
  } = useUserSession()
  const toast = useToast()
  const authStore = useAuthStore()

  const logout = async () => {
    isLoading.value = true
    try {
      if (!ready) {
        await fetchSession()
      }

      if (!loggedIn) return

      authStore.reset()
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

  return {
    isLoading,
    ready,
    loggedIn,
    user,

    logout,
  }
}
