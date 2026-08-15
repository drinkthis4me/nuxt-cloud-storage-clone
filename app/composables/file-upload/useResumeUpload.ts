export function useResumeUpload() {
  const { uploadChunked } = useUploadFile()
  const { getFileHandle } = useActiveFileHandles()
  const toast = useToast()

  function resumeUpload(fileId: string) {
    const file = getFileHandle(fileId)

    if (file === null) {
      toast.add({
        color: 'error',
        title: 'File not found. Please start a new upload.',
      })
      return null
    }

    return uploadChunked(file, fileId, true)
  }

  return {
    resumeUpload,
  }
}
