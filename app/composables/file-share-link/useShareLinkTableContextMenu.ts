import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'

export function useShareLinkTableContextMenu(token: MaybeRefOrGetter<string>) {
  const contextMenuItems = shallowRef<ContextMenuItem[]>([])

  const { download } = useShareLinkDownload(token)

  function getSharedWithMeItems(row: TableRow<SerializedFile>): ContextMenuItem[] {
    const items = [
      {
        label: 'Download',
        icon: 'i-lucide-download',
        async onSelect() {
          await download(row.original.id)
        },
      },
    ] satisfies ContextMenuItem[]

    return items
  }

  function onContextMenu(_e: Event, row: TableRow<SerializedFile>): void {
    contextMenuItems.value = getSharedWithMeItems(row)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
