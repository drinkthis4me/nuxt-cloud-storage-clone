import { HTTP_STATUS } from '#server/utils/httpStatus'
import { validateRequest } from '#server/utils/validateRequest'
import { fileSchema, fileStatus } from '#shared/schemas/file'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getStorageKey } from '~~/server/utils/getStorageKey'
import { usePrismaClient } from '~~/server/utils/prisma'
import { useS3Client } from '~~/server/utils/s3'
import { serializeFile } from '~~/server/utils/serializeFile'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await validateRequest(event, readValidatedBody, fileSchema)

  try {
    const prismaClient = usePrismaClient()
    const existing = await prismaClient.file.findFirst({
      where: {
        ownerId: user.id,
        fingerprint: body.fingerprint,
        status: fileStatus.UPLOADED,
      },
    })

    if (existing) {
      return {
        duplicate: true,
        file: serializeFile(existing),
      }
    }

    const fileId = crypto.randomUUID()
    const storageKey = getStorageKey(user.id, fileId)

    const file = await prismaClient.file.create({
      data: {
        id: fileId,
        ownerId: user.id,
        name: body.name,
        mimeType: body.mimeType,
        size: body.size,
        fingerprint: body.fingerprint,
        storageKey,
        status: 'UPLOADING',
        parentFolderId: body.parentFolderId ?? null,
      },
    })

    const config = useRuntimeConfig(event)
    const command = new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: storageKey,
      ContentType: body.mimeType,
    })

    const s3 = useS3Client()
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    return {
      duplicate: false,
      fileId: file.id,
      uploadUrl,
    }
  }
  catch (err) {
    console.log(err)

    throw createError({
      ...HTTP_STATUS.INTERNAL_SERVER_ERROR,
    })
  }
})
