// import type { SerializedFile } from '~~/shared/types/response/files'

export function useFileMove() {
  const toast = useToast()

  const moveFiles = async (fileIds: string[], targetFolderId: string) => {
    try {
      // TODO: file edit api
      // await Promise.all(
      //   fileIds.map(id =>
      //     $fetch<{ file: SerializedFile }>(`/api/files/${id}`, {
      //       method: 'PATCH',
      //       body: { parentFolderId: targetFolderId },
      //     }),
      //   ),
      // )
      console.log('Moving files')
      console.log('Files ', fileIds)
      console.log('will be moved under folder: ', targetFolderId)
    }
    catch (err) {
      console.error('Failed to move files', err)
      // surface a toast here once you have one wired up
      toast.add({
        color: 'error',
        title: 'Error',
        description: 'Failed to move files',
      })
    }
  }

  return { moveFiles }
}
