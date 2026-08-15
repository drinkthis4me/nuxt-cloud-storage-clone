import DialogUploadFile from '~/components/dialog/DialogUploadFile.vue'
import { fileSchema } from '~~/shared/schemas/file'
import { uploadStrategy } from '~~/shared/const/uploadStrategy'

import type { ButtonProps } from '@nuxt/ui'
import type { FileSchema } from '~~/shared/schemas/file'
import type {
  CreateFileUploadResponse,
  FileResponse,
  SerializedFile,
} from '~~/shared/types/response/files'
import type {
  InitChunkedUploadResponse,
  ChunkPresignedUrlResponse,
  ChunkCompleteResponse,
  FinalizeChunkedUploadResponse,
  ChunkStatusResponse,
} from '#shared/types/response/chunks'

// TODO: compress before upload
export function useUploadFile() {
  const overlay = useOverlay()
  const toast = useToast()
  const store = useUploadQueueStore()
  const route = useRoute()
  const { register, unregister } = useActiveUploads()
  const { setFileHandle, deleteFileHandle } = useActiveFileHandles()
  const { showErrorToast } = useErrorToast()

  async function openDialog(): Promise<File | null> {
    const modal = overlay.create(DialogUploadFile, {
      destroyOnClose: true,
    })

    return modal.open()
  }

  async function uploadSingleFile(uploadUrl: string, file: File, fileId: string) {
    // Upload to S3
    await $fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    })

    // Mark upload as complete
    const {
      file: completedFile,
    } = await $fetch<FileResponse>(
      `/api/files/${fileId}/complete`,
      { method: 'POST' },
    )

    return completedFile
  }

  // Upload chunk to S3 with XMLHttpRequest to track upload progress
  async function _uploadChunkWithProgress(
    fileId: string,
    uploadUrl: string,
    blob: Blob,
    onProgress: (loadedBytes: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      register(fileId, xhr)
      xhr.open('PUT', uploadUrl)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded)
      }

      xhr.onload = () => {
        unregister(fileId)
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader('ETag')
          if (etag) {
            resolve(etag)
          }
          else {
            reject(new Error('Missing ETag'))
          }
        }
        else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        unregister(fileId)
        reject(new Error('Network error during upload'))
      }

      xhr.onabort = () => {
        unregister(fileId)
        reject(new Error('Upload aborted'))
      }

      xhr.send(blob)
    })
  }

  async function uploadChunked(file: File, fileId: string, resuming = false): Promise<SerializedFile | null> {
    let chunkSize: number
    let totalChunks: number
    let alreadyUploadedParts: Set<number>

    if (resuming) {
      const status = await $fetch<ChunkStatusResponse>(`/api/files/${fileId}/chunks`)

      totalChunks = status.chunks.length
      chunkSize = Math.ceil(file.size / totalChunks)
      alreadyUploadedParts = new Set(
        status.chunks
          .filter(c => c.status === 'UPLOADED')
          .map(c => c.partNumber),
      )
    }
    else {
      const init = await $fetch<InitChunkedUploadResponse>(
        `/api/files/${fileId}/chunks/init`,
        { method: 'POST' },
      )

      chunkSize = init.chunkSize
      totalChunks = init.totalChunks
      alreadyUploadedParts = new Set()

      store.upsert({
        fileId,
        name: file.name,
        mimeType: file.type,
        status: 'uploading',
        totalBytes: file.size,
        uploadedBytes: 0,
        totalChunks,
        uploadedChunks: 0,
        isChunked: true,
        updatedAt: new Date().toISOString(),
      })
    }

    // Seed progress bar correctly if resuming
    let uploadedBytesSoFar = alreadyUploadedParts.size * chunkSize
    store.updateProgress(fileId, uploadedBytesSoFar)
    store.setStatus(fileId, 'uploading')

    // Split file into chunks
    for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
      if (alreadyUploadedParts.has(partNumber)) continue

      // Check for pause: If true, resuming will pick up from this partNumber next time
      if (store.entries.get(fileId)?.status === 'paused') return null

      const start = (partNumber - 1) * chunkSize
      const chunkBlob = file.slice(start, start + chunkSize)

      // Get presigned url
      const { uploadUrl } = await $fetch<ChunkPresignedUrlResponse>(
        `/api/files/${fileId}/chunks/${partNumber}/presigned-url`,
        { method: 'POST' },
      )

      // Upload and track progress
      let etag: string
      try {
        etag = await _uploadChunkWithProgress(
          fileId,
          uploadUrl,
          chunkBlob,
          loaded => store.updateProgress(fileId, uploadedBytesSoFar + loaded),
        )
      }
      catch (err) {
        // Abort (pause/cancel) or error
        if (store.entries.get(fileId)?.status !== 'paused') {
          store.setStatus(fileId, 'error')
        }
        throw err
      }
      uploadedBytesSoFar += chunkBlob.size
      store.updateProgress(fileId, uploadedBytesSoFar)

      // Mark chunk as complete
      await $fetch<ChunkCompleteResponse>(
        `/api/files/${fileId}/chunks/${partNumber}/complete`,
        {
          method: 'POST',
          body: { etag },
        },
      )
    }

    // Mark file upload as complete
    const { file: completedFile } = await $fetch<FinalizeChunkedUploadResponse>(
      `/api/files/${fileId}/chunks/complete`,
      { method: 'POST' },
    )
    store.setStatus(fileId, 'done')

    return completedFile
  }

  function showUploadingToast(fileId: string) {
    const actionButton: ButtonProps = {
      icon: 'i-lucide-search',
      label: 'See upload progress',
      color: 'neutral',
      variant: 'outline',
      onClick: (e) => {
        e?.stopPropagation()
        console.log(route.path)
        navigateTo('/app/uploading')
      },
    }

    toast.add({
      id: fileId,
      title: 'Uploading file...',
      description: 'Your file is being uploaded.',
      icon: 'i-lucide-cloud-upload',
      duration: 0,
      actions: [
        ...(route.path !== '/app/uploading' ? [actionButton] : []),
      ],
      ui: {
        icon: 'motion-safe:animate-bounce',
      },
    })
  }

  function showCompleteToast(fileEntry: SerializedFile) {
    const actionButton: ButtonProps = {
      icon: 'i-lucide-folder-search',
      label: 'See file location',
      color: 'neutral',
      variant: 'outline',
      onClick: (e) => {
        e?.stopPropagation()
        const path = fileEntry.parentFolderId === null
          ? '/app/folders'
          : `/app/folders/${fileEntry.parentFolderId}`
        navigateTo(path)
      },
    }

    toast.update(
      fileEntry.id,
      {
        title: 'File uploaded!',
        description: 'Your file has been successfully uploaded.',
        icon: 'i-lucide-check',
        color: 'success',
        actions: [
          actionButton,
        ],
        ui: {
          icon: 'motion-safe:animate-none',
        },
      },
    )
  }

  async function upload(file: File, parentFolderId: string | null = null) {
    let toastId: string | null = null

    try {
      const fingerprint = await sha256(file)

      const body: FileSchema = {
        isFolder: false,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        fingerprint,
        parentFolderId,
      }

      const validBody = fileSchema.parse(body)

      const result = await $fetch<CreateFileUploadResponse>('/api/files', {
        method: 'POST',
        body: validBody,
      })

      if (result.duplicate) return result.file

      showUploadingToast(result.file.id)
      toastId = result.file.id

      // Store File for pause/resume
      setFileHandle(result.file.id, file)

      let completed: SerializedFile | null = null
      if (result.uploadStrategy === uploadStrategy.SINGLE) {
        if (!result.uploadUrl) {
          throw new Error('Missing upload URL in response')
        }

        completed = await uploadSingleFile(result.uploadUrl, file, result.file.id)
      }
      else { // uploadStrategy === 'CHUNKED'
        completed = await uploadChunked(file, result.file.id)
      }

      if (completed !== null) {
        showCompleteToast(completed)
        const folderKey = getFolderKey(completed.parentFolderId)
        await refreshNuxtData(folderKey)
      }
      deleteFileHandle(result.file.id)
      return completed
    }
    catch (err) {
      console.log('[useUploadFile.upload] Upload failed.', { cause: err })

      if (toastId) {
        toast.remove(toastId)
      }
      showErrorToast({
        error: err,
        title: 'Upload failed. Please try again.',
      })

      return null
    }
  }

  async function promptAndUploadFile(parentFolderId: string | null = null) {
    const file = await openDialog()

    if (!file) return

    upload(file, parentFolderId)
  }

  return {
    promptAndUploadFile,
    uploadChunked,
  }
}
