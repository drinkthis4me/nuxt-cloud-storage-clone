// Get useShareLinkList() fetch key
export function getShareLinkKey(fileId: MaybeRefOrGetter<string>): string {
  const currentFileId = toValue(fileId)
  return `share-links-${currentFileId}`
}
