import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'

export function useSharedByMeTableContextMenu() {
  const contextMenuItems = shallowRef<ContextMenuItem[]>([])

  const { download } = useDownloadFile()
  const { openDialog: openShareDialog } = useShareLink()
  const { openDialog: openManageAccessDialog } = useManageAccess()

  function getItems(row: TableRow<SerializedFile>): ContextMenuItem[] {
    const items = [
      {
        label: 'Share',
        icon: 'i-lucide-user-plus',
        onSelect() {
          openShareDialog({
            fileId: row.original.id,
            fileName: row.original.name,
          })
        },
      },
      {
        label: 'Manage access',
        icon: 'i-lucide-user-plus',
        onSelect() {
          openManageAccessDialog({
            fileId: row.original.id,
            fileName: row.original.name,
          })
        },
      },
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
    contextMenuItems.value = getItems(row)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
