import { fileIdSchema } from '#shared/schemas/file'

import type { DownloadUrlResponse } from '#shared/types/response/files'

export function useDownloadFile() {
  const toast = useToast()

  // TODO: show download progress
  // TODO: decompress file
  async function download(fileId: string) {
    try {
      const param = { id: fileId }
      const validParam = fileIdSchema.parse(param)

      const { downloadUrl } = await $fetch<DownloadUrlResponse>(
        `/api/files/${validParam.id}/download-url`,
        { method: 'GET' },
      )

      const link = document.createElement('a')
      link.href = downloadUrl
      link.click()
      link.remove()
    }
    catch (err) {
      console.log(err)
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Download failed. Pleases try again.',
      })
    }
  }

  return {
    download,
  }
}
