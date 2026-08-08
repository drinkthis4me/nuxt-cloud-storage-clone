import { defineStore, acceptHMRUpdate } from 'pinia'
import { fileScope, fileStatus } from '#shared/schemas/file'

import type { SerializedFile, FileListResponse } from '#shared/types/response/files'

export const useFileTableStore = defineStore('fileTable', () => {
  const files = shallowRef<SerializedFile[]>([])
  const isLoading = shallowRef(false)

  const requestFetch = useRequestFetch()

  const fetchFiles = async () => {
    isLoading.value = true

    try {
      const res = await requestFetch<FileListResponse>('/api/files', {
        method: 'GET',
        query: {
          scope: fileScope.MINE,
          status: [fileStatus.UPLOADED, fileStatus.UPLOADING].join(','),
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
  import.meta.hot.accept(acceptHMRUpdate(useFileTableStore, import.meta.hot))
}
