const activeUploads = new Map<string, XMLHttpRequest>()

// Track each chunk upload in "useUploadFile()._uploadChunkWithProgress"
export function useActiveUploads() {
  function register(fileId: string, xhr: XMLHttpRequest) {
    activeUploads.set(fileId, xhr)
  }

  function unregister(fileId: string) {
    activeUploads.delete(fileId)
  }

  function abort(fileId: string): boolean {
    const xhr = activeUploads.get(fileId)
    if (!xhr) return false

    xhr.abort()
    unregister(fileId)
    return true
  }

  return {
    register,
    unregister,
    abort,
  }
}
