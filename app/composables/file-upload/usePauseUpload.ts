export function usePauseUpload() {
  const store = useUploadQueueStore()
  const { abort } = useActiveUploads()

  // Stops whatever chunk is mid-flight right now
  // See: useUploadFile().uploadChunked
  function pauseUpload(fileId: string) {
    store.setStatus(fileId, 'paused')
    abort(fileId)
  }

  return {
    pauseUpload,
  }
}
