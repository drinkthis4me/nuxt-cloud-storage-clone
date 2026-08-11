import { fileScope } from '#shared/schemas/file'
import type { SerializedFile, FileListResponse } from '#shared/types/response/files'

export const useFolderContents = (folderId: MaybeRefOrGetter<string | null>) => {
  const parentFolderId = computed(() => toValue(folderId))
  const query = computed(() => ({
    ...(parentFolderId.value ? { parentFolderId: parentFolderId.value } : {}),
    scope: fileScope.MINE,
  }))

  // FIXME: extract to getFetchKey util
  const {
    data,
    status,
    error,
    refresh,
  } = useFetch<FileListResponse>('/api/files', {
    key: computed(() => `folder-contents-${parentFolderId.value ?? 'root'}`),
    query,
    watch: [parentFolderId],
  })

  const files = computed(() => data.value?.files ?? [])
  const isPending = computed(() => status.value === 'pending')

  // Update fn for after editing file to avoid refetching
  function patchFile(fileIds: string[], updated: SerializedFile | null) {
    if (!data.value?.files) return

    if (updated == null) {
      // Files deleted
      const idSet = new Set(fileIds)
      data.value = {
        ...data.value,
        files: data.value.files.filter(f => !idSet.has(f.id)),
      }
    }
    else {
      // One file updated
      data.value = {
        ...data.value,
        files: data.value.files.map(f => (f.id === fileIds[0]! ? updated : f)),
      }
    }
  }

  return {
    files,
    isPending,
    error,
    refresh,
    patchFile,
  }
}
