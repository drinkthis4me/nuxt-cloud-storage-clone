import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { validateShareLink } from '#server/utils/shareLink'
import { fileStatus } from '~~/shared/schemas/file'
import { shareLinkTokenSchema, resolveShareLinkQuerySchema } from '~~/shared/schemas/shareLink'

import type { ResolveShareLinkResult } from '~~/shared/types/response/shareLink'
import type { File, PrismaClient } from '~~/prisma/generated/client'

const MAX_DEPTH = 50

export default defineEventHandler(async (event): Promise<ResolveShareLinkResult> => {
  const { token } = await validateRequest(event, getValidatedRouterParams, shareLinkTokenSchema)
  const { folder: requestedFolderId } = await validateRequest(event, getValidatedQuery, resolveShareLinkQuerySchema)

  const prismaClient = usePrismaClient()

  const shareLink = await validateShareLink(event, token, prismaClient)

  let targetFolder: File = shareLink.file

  if (requestedFolderId && requestedFolderId !== shareLink.file.id) {
    if (!shareLink.file.isFolder) {
      throw createError({
        ...HTTP_STATUS.BAD_REQUEST,
        message: 'This link does not point to a folder',
      })
    }

    const requested = await loadFolderIfWithinTree(requestedFolderId, shareLink.file.id, prismaClient)
    if (!requested) {
      throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Folder not found' })
    }
    targetFolder = requested
  }

  const baseResponse = {
    file: serializeFile(targetFolder),
    permission: shareLink.permission,
    requiresPassword: false as const,
  }

  if (!shareLink.file.isFolder) {
    return baseResponse
  }

  let children
  try {
    children = await prismaClient.file.findMany({
      where: {
        parentFolderId: baseResponse.file.id,
        status: { not: fileStatus.DELETED },
      },
      orderBy: [{ isFolder: 'desc' }, { name: 'asc' }],
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return {
    ...baseResponse,
    children: children.map(serializeFile),
  }
})

/**
 * Confirm the requested subfolder is under the shared folder.
 *
 * Walk from requested folder to root.
 */
async function loadFolderIfWithinTree(
  requestedId: string,
  rootId: string,
  prismaClient: PrismaClient,
): Promise<File | null> {
  let requestedFolder: File | null
  try {
    requestedFolder = await prismaClient.file.findUnique({
      where: { id: requestedId },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!requestedFolder || !requestedFolder.isFolder || requestedFolder.status === fileStatus.DELETED) {
    return null
  }

  let currentId: string | null = requestedFolder.parentFolderId
  let depth = 0

  while (currentId) {
    if (depth++ > MAX_DEPTH) {
      throw createError({
        ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Folder chain too deep',
      })
    }

    if (currentId === rootId) {
      return requestedFolder
    }

    let parent
    try {
      parent = await prismaClient.file.findUnique({
        where: { id: currentId },
        select: { parentFolderId: true },
      })
    }
    catch (err: unknown) {
      console.error(err)
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }

    currentId = parent?.parentFolderId ?? null
  }

  // Requested folder not in the shared tree
  return null
}
