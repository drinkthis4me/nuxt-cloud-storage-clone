import { fileIdSchema } from '#shared/schemas/file'

export default defineNuxtRouteMiddleware((to) => {
  const folderId = to.params.folderId

  if (!folderId || typeof folderId !== 'string') {
    return navigateTo('/app')
  }

  const res = fileIdSchema.safeParse({ id: folderId })

  if (!res.success) {
    return navigateTo('/app')
  }
})
