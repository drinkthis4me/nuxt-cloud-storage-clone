import type { SerializedFile, FileResponse } from '#shared/types/response/files'
import { LRUCache } from '~/utils/LRUCache'

export function useFileDetail() {
  const cache = new LRUCache<string, SerializedFile>()

  async function fetchFileDetail(fileId: string): Promise<SerializedFile | null> {
    const cached = cache.get(fileId)
    if (cached !== null) {
      return cached
    }

    try {
      const { file } = await $fetch<FileResponse>(`/api/files/${fileId}`)
      cache.put(fileId, file)

      return file
    }
    catch (err) {
      console.error('[useFileDetail] Failed to fetch file details', { cause: err })
      return null
    }
  }

  return {
    fetchFileDetail,
  }
}
