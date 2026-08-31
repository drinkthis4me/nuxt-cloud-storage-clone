import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { validateShareLink } from '#server/utils/shareLink'
import { fileStatus } from '~~/shared/schemas/file'
import { shareLinkTokenSchema, shareLinkBreadcrumbsSchema } from '~~/shared/schemas/shareLink'

import type { PrismaClient, File } from '~~/prisma/generated/client'
import type { ShareLinkBreadcrumbsResponse } from '~~/shared/types/response/shareLink'
import type { SerializedFile } from '~~/shared/types/response/files'

const MAX_DEPTH = 50

export default defineEventHandler(async (event): Promise<ShareLinkBreadcrumbsResponse> => {
  const { token } = await validateRequest(event, getValidatedRouterParams, shareLinkTokenSchema)
  const { folder: requestedFolderId } = await validateRequest(event, getValidatedQuery, shareLinkBreadcrumbsSchema)

  const prismaClient = usePrismaClient()

  const shareLink = await validateShareLink(event, token, prismaClient)

  if (!requestedFolderId || requestedFolderId === shareLink.file.id) {
    return { breadcrumbs: [] }
  }

  if (!shareLink.file.isFolder) {
    throw createError({ ...HTTP_STATUS.BAD_REQUEST, message: 'This link does not point to a folder' })
  }

  const breadcrumbs = await walkUpToRoot(requestedFolderId, shareLink.file.id, prismaClient)

  if (breadcrumbs === null) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Folder not found' })
  }

  return { breadcrumbs }
})

// Walks up from the requested folder toward the link's root, collecting the chain.
// But stops (and returns it) the instant it reaches rootId, never
// continuing further up into folders the link has no access to.
async function walkUpToRoot(
  startId: string,
  rootId: string,
  prismaClient: PrismaClient,
): Promise<SerializedFile[] | null> {
  const chain: File[] = []
  let currentId: string | null = startId
  let depth = 0
  let foundRoot = false

  while (currentId) {
    if (depth++ > MAX_DEPTH) {
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Folder chain too deep' })
    }

    let folder
    try {
      folder = await prismaClient.file.findUnique({ where: { id: currentId } })
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }

    if (!folder || folder.status === fileStatus.DELETED) return null

    chain.unshift(folder)

    if (folder.id === rootId) {
      foundRoot = true
      break
    }

    currentId = folder.parentFolderId
  }

  if (!foundRoot) return null

  const withoutRoot = chain.slice(1)

  return withoutRoot.map(f => serializeFile(f))
}
