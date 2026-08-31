import DialogShareFile from '~/components/dialog/shareFile/DialogShareFile.vue'
import { fileIdSchema } from '~~/shared/schemas/file'
import {
  shareLinkSchema,
  shareLinkIdSchema,
  editShareLinkSchema,
} from '~~/shared/schemas/shareLink'

import type {
  ShareLinkSchema,
  EditShareLinkSchema,
  ShareLinkIdSchema,
} from '~~/shared/schemas/shareLink'
import type { ShareLinkResponse, RevokeShareLinkResponse } from '~~/shared/types/response/shareLink'

export function useShareLink() {
  const isLoading = shallowRef(false)

  const overlay = useOverlay()
  const toast = useToast()
  const config = useRuntimeConfig()

  function getShareLinkUrl(token: string) {
    return `${config.public.appUrl}/share/${token}`
  }

  interface OpenDialogOption {
    fileId: string
    fileName: string
  }
  async function openDialog(option: OpenDialogOption) {
    const modal = overlay.create(DialogShareFile,
      { destroyOnClose: true },
    )

    return modal.open(option)
  }

  interface ShareLinkResponseWithUrl extends ShareLinkResponse {
    url: string
  }
  async function createShareLink(fileId: string, body: ShareLinkSchema): Promise<ShareLinkResponseWithUrl | null> {
    isLoading.value = true
    try {
      const parsedFileId = fileIdSchema.safeParse({ id: fileId })
      const parsedBody = shareLinkSchema.safeParse(body)

      if (!parsedFileId.success || !parsedBody.success) {
        throw new Error('Parse id failed', { cause: 'Schema parse failed' })
      }

      const id = parsedFileId.data.id
      const validBody = parsedBody.data

      const res = await $fetch<ShareLinkResponse>(`/api/files/${id}/share-links`, {
        method: 'POST',
        body: validBody,
      })

      return {
        ...res,
        url: getShareLinkUrl(res.token),
      }
    }
    catch (err) {
      console.error('[useShareLink().createShareLink] Schema parse failed', err)

      const errMsg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Failed to create share link',
        description: errMsg,
      })
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  async function editShareLink(ids: ShareLinkIdSchema, body: EditShareLinkSchema) {
    isLoading.value = true
    try {
      const parsedIds = shareLinkIdSchema.safeParse({
        id: ids.id,
        linkId: ids.linkId,
      })
      const parsedBody = editShareLinkSchema.safeParse(body)

      if (!parsedIds.success || !parsedBody.success) {
        throw new Error('Parse id failed', { cause: 'Schema parse failed' })
      }

      const {
        id: validFileId,
        linkId: validLinkId,
      } = parsedIds.data
      const validBody = parsedBody.data

      const updated = await $fetch<ShareLinkResponse>(`/api/files/${validFileId}/share-links/${validLinkId}`, {
        method: 'PATCH',
        body: validBody,
      })

      return updated
    }
    catch (err) {
      console.error('[useShareLink().editShareLink] Schema parse failed', err)
      const errMsg = getErrorMessage(err)
      toast.add({
        color: 'error',
        title: 'Failed to edit share link',
        description: errMsg,
      })
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  async function revokeShareLink(ids: ShareLinkIdSchema): Promise<RevokeShareLinkResponse | null> {
    isLoading.value = true
    try {
      const parsedIds = shareLinkIdSchema.safeParse({
        id: ids.id,
        linkId: ids.linkId,
      })

      if (!parsedIds.success) {
        throw new Error('Parse id failed', { cause: 'Schema parse failed' })
      }

      const {
        id: validFileId,
        linkId: validLinkId,
      } = parsedIds.data

      const res = await $fetch<RevokeShareLinkResponse>(
        `/api/files/${validFileId}/share-links/${validLinkId}`,
        { method: 'DELETE' },
      )

      return res
    }
    catch (err) {
      console.error('[useShareLinkList().revoke] Failed to revoke link', err)
      toast.add({
        color: 'error',
        title: 'Failed to delete share link',
      })
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    getShareLinkUrl,
    openDialog,
    createShareLink,
    editShareLink,
    revokeShareLink,
  }
}
