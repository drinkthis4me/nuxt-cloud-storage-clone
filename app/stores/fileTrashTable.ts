import { defineStore, acceptHMRUpdate } from 'pinia'
import { fileScope, fileStatus } from '#shared/schemas/file'

import type { SerializedFile, FileListResponse } from '#shared/types/response/files'

export const useFileTrashTableStore = defineStore('fileTrashTable', () => {
  const files = shallowRef<SerializedFile[]>([])
  const isLoading = shallowRef(false)

  const requestFetch = useRequestFetch()

  async function fetchFiles() {
    isLoading.value = true

    try {
      const res = await requestFetch<FileListResponse>('/api/files', {
        method: 'GET',
        query: {
          scope: fileScope.MINE,
          status: fileStatus.DELETED,
        },
      })

      files.value = res.files
    }
    catch (err) {
      console.log(err)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    files,
    isLoading,
    fetchFiles,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFileTrashTableStore, import.meta.hot))
}
