import { S3Client } from '@aws-sdk/client-s3'

export function useS3Client() {
  const config = useRuntimeConfig()

  return new S3Client({
    endpoint: config.minio.endpoint,
    region: config.minio.region,
    credentials: {
      accessKeyId: config.minio.accessKey,
      secretAccessKey: config.minio.secretKey,
    },
    forcePathStyle: true,
  })
}
