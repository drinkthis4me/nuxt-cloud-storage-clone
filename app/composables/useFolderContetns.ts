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
  const patchFile = (fileId: string, updated: SerializedFile) => {
    if (!data.value?.files) return

    data.value = {
      ...data.value,
      files: data.value.files.map(f => (f.id === fileId ? updated : f)),
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
