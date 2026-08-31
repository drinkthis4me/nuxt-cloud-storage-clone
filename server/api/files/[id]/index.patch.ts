import { usePrismaClient } from '#server/utils/prisma'
import { HTTP_STATUS } from '#server/utils/httpStatus'
import { serializeFile } from '#server/utils/serializeFile'
import { fileIdSchema, editFileSchema } from '#shared/schemas/file'
import { sharePermission } from '#shared/schemas/shareLink'

import type { PrismaClient, File } from '~~/prisma/generated/client'
import type { FileResponse } from '#shared/types/response/files'

export default defineEventHandler(async (event): Promise<FileResponse> => {
  const { user } = await requireUserSession(event)
  const { id: fileId } = await validateRequest(event, getValidatedRouterParams, fileIdSchema)
  const body = await validateRequest(event, readValidatedBody, editFileSchema)

  const prismaClient = usePrismaClient()
  let file: File | null

  try {
    file = await prismaClient.file.findUnique({
      where: { id: fileId },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!file || file.ownerId !== user.id) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'File not found' })
  }

  if (body.parentFolderId !== undefined && body.parentFolderId !== file.parentFolderId) {
    await assertValidMoveTarget(file, body.parentFolderId, user.id, prismaClient)
  }

  let updated
  try {
    updated = await prismaClient.file.update({
      where: { id: file.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.parentFolderId !== undefined ? { parentFolderId: body.parentFolderId } : {}),
      },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  return { file: serializeFile(updated) }
})

/**
 * Move validation:
 *
 * Target must exist, be a folder, be owned/edit-accessible,
 * and must not be the file itself or one of its own descendants.
 */
async function assertValidMoveTarget(
  file: File,
  targetFolderId: string | null,
  userId: number,
  prismaClient: PrismaClient,
) {
  if (targetFolderId === null) return // moving to root is always valid

  if (targetFolderId === file.id) {
    throw createError({
      ...HTTP_STATUS.CONFLICT,
      message: 'Cannot move a folder into itself',
    })
  }

  let target
  try {
    target = await prismaClient.file.findUnique({
      where: { id: targetFolderId },
      include: { shares: { where: { userId } } },
    })
  }
  catch (err: unknown) {
    console.error(err)
    throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }

  if (!target || !target.isFolder) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Target folder not found' })
  }

  const isOwner = target.ownerId === userId
  const hasEditAccess = target.shares.some(s => s.permission === sharePermission.EDIT)
  if (!isOwner && !hasEditAccess) {
    throw createError({ ...HTTP_STATUS.NOT_FOUND, message: 'Target folder not found' })
  }

  // Only folders can have descendants worth checking. Skipped for file moves.
  if (file.isFolder) {
    await assertNotDescendant(file.id, targetFolderId, prismaClient)
  }
}

async function assertNotDescendant(
  folderId: string,
  candidateTargetId: string,
  prismaClient: PrismaClient,
) {
  let currentId: string | null = candidateTargetId
  let depth = 0
  const MAX_DEPTH = 50

  while (currentId) {
    if (depth++ > MAX_DEPTH) {
      throw createError({ ...HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Folder chain too deep' })
    }

    if (currentId === folderId) {
      throw createError({
        ...HTTP_STATUS.CONFLICT,
        message: 'Cannot move a folder into one of its own subfolders',
      })
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
}
