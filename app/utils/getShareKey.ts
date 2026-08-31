// Get useShareList() fetch key
export function getShareKey(fileId: MaybeRefOrGetter<string>): string {
  const currentFileId = toValue(fileId)
  return `share-${currentFileId}`
}
