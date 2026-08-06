import { fileIdSchema } from '#shared/schemas/file'

import type {
  SoftDeleteFileResponse,
  HardDeleteFileResponse,
} from '#shared/types/response/files'

export const useDeleteFile = () => {
  const toast = useToast()

  const softDelete = async (id: string) => {
    try {
      const valid = fileIdSchema.parse({ id })
      const { file } = await $fetch<SoftDeleteFileResponse>(`/api/files/${valid.id}`, {
        method: 'DELETE',
      })

      toast.add({
        color: 'success',
        title: 'Deleted',
        description: file.name,
      })
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Delete failed. Please try again.',
      })
    }
  }

  const hardDelete = async (id: string, name: string) => {
    try {
      const valid = fileIdSchema.parse({ id })
      const { deleted } = await $fetch<HardDeleteFileResponse>(`/api/files/${valid.id}`, {
        method: 'DELETE',
        query: { permanent: true },
      })

      if (deleted) {
        toast.add({
          color: 'success',
          title: 'Permanent deleted',
          description: name,
        })
      }
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Delete failed. Please try again.',
      })
    }
  }

  return {
    softDelete,
    hardDelete,
  }
}
