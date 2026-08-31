import type { DownloadUrlResponse } from '~~/shared/types/response/files'

export function useShareLinkDownload(token: MaybeRefOrGetter<string>) {
  const toast = useToast()

  async function download(fileId?: string) {
    try {
      const { downloadUrl } = await $fetch<DownloadUrlResponse>(
        `/api/share/${toValue(token)}/download-url`,
        {
          method: 'GET',
          query: fileId ? { fileId } : undefined,
        },
      )

      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.click()
      link.remove()
    }
    catch (err) {
      console.error('Download failed', err)

      const msg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Download failed',
        description: msg,
      })
    }
  }

  return {
    download,
  }
}
