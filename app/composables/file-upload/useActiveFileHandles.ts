const activeFileHandles = new Map<string, File>()

// Store file blob from input for pause/resume upload features
export function useActiveFileHandles() {
  function setFileHandle(fileId: string, file: File) {
    activeFileHandles.set(fileId, file)
  }

  function hasFileHandle(fileId: string): boolean {
    return activeFileHandles.has(fileId)
  }

  function getFileHandle(fileId: string): File | null {
    if (!hasFileHandle(fileId)) return null

    return activeFileHandles.get(fileId)!
  }

  function deleteFileHandle(fileId: string) {
    activeFileHandles.delete(fileId)
  }

  return {
    setFileHandle,
    hasFileHandle,
    getFileHandle,
    deleteFileHandle,
  }
}
