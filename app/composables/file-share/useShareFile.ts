import type { ShareSchema, ShareIdSchema } from '~~/shared/schemas/share'
import type { CreateShareResponse, RevokeShareResponse } from '~~/shared/types/response/share'

export function useShareFile() {
  const isLoading = shallowRef(false)
  const toast = useToast()

  async function create(fileId: string, payload: ShareSchema) {
    isLoading.value = true
    try {
      const res = await $fetch<CreateShareResponse>(`/api/files/${fileId}/shares`, {
        method: 'POST',
        body: payload,
      })

      return res
    }
    catch (err) {
      console.log(err)

      const msg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Failed to share file',
        description: msg,
      })

      return null
    }
    finally {
      isLoading.value = false
    }
  }

  async function revoke(payload: ShareIdSchema) {
    const { id, shareId } = payload

    isLoading.value = true
    try {
      const res = await $fetch<RevokeShareResponse>(`/api/files/${id}/shares/${shareId}`, {
        method: 'DELETE',
      })

      return res
    }
    catch (err) {
      console.log(err)

      const msg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Failed to revoke share',
        description: msg,
      })

      return null
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    create,
    revoke,
  }
}
