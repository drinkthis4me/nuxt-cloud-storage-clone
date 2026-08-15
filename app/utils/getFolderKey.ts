// Get useFolderContents fetch key
export function getFolderKey(parentFolderId: MaybeRefOrGetter<string | null>): string {
  const currentParent = toValue(parentFolderId) ?? 'root'
  return `folder-contents-${currentParent}`
}
