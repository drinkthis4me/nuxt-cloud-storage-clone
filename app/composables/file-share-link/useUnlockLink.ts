import { shareLinkTokenSchema } from '#shared/schemas/shareLink'

export function useUnlockLink() {
  const loading = shallowRef(false)
  const toast = useToast()

  function validateToken(token: unknown): string {
    if (typeof token !== 'string') {
      throw new Error('Token must be a string')
    }

    const parsed = shareLinkTokenSchema.safeParse({ token })
    if (!parsed.success) {
      throw new Error('Parse token failed')
    }

    return parsed.data.token
  }

  async function unlock(token: string, password: string) {
    loading.value = true
    try {
      const validToken = validateToken(token)

      const res = await $fetch(`/api/share/${validToken}/unlock`, {
        method: 'POST',
        body: {
          password,
        },
      })

      return res
    }
    catch (err) {
      const msg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Unlock share link failed',
        description: msg,
      })

      return null
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    validateToken,
    unlock,
  }
}
