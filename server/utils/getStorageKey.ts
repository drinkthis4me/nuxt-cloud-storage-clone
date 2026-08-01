export const getStorageKey = (userId: number, fileId: string): string => {
  return `users/${userId}/${fileId}`
}
