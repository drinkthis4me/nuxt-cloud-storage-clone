import type { SerializedFile } from '~~/shared/types/response/files'
import type { ContextMenuItem, TableRow } from '@nuxt/ui'

interface useRecentFileTableContextMenuOptoins {
  onRenamed?: (file: SerializedFile) => void
  onMoved?: () => void
  onSoftDeleted?: (ids: string[]) => void
}

export function useRecentFileTableContextMenu(options: useRecentFileTableContextMenuOptoins) {
  const {
    onRenamed,
    onMoved,
    onSoftDeleted,
  } = options

  const contextMenuItems = shallowRef<ContextMenuItem[]>([])

  const { download } = useDownloadFile()
  const { promptAndRename } = useRenameFile()
  const { promptAndMove } = useMoveFile()
  const { softDelete } = useDeleteFile()

  function getRowItems(row: TableRow<SerializedFile>): ContextMenuItem[] {
    const target = row.original

    const items = [
      {
        label: 'Download',
        icon: 'i-lucide-download',
        async onSelect() {
          await download(target.id)
        },
      },
      {
        label: 'Rename',
        icon: 'i-lucide-pen-line',
        async onSelect() {
          const updated = await promptAndRename(target.id, target.name)
          if (updated) {
            onRenamed?.(updated)
          }
        },
      },
      {
        label: 'Move to',
        icon: 'i-lucide-pen-line',
        async onSelect() {
          const fileToMove = [{ id: target.id, name: target.name }]
          const currentParentFolderId = target.parentFolderId ?? null
          const result = await promptAndMove(fileToMove, currentParentFolderId)

          if (result && result.succeededIds.length > 0) {
            onMoved?.()
          }
        },
      },
      {
        type: 'separator' as const,
      },
      {
        label: 'Share',
        icon: 'i-lucide-user-plus',
        onSelect() {
        },
      },
      {
        label: 'Info',
        icon: 'i-lucide-info',
      },
      {
        type: 'separator' as const,
      },
      {
        label: 'Move to trash bin',
        icon: 'i-lucide-trash',
        async onSelect() {
          const results = await softDelete([target.id])

          if (results && results.succeededIds.length > 0) {
            onSoftDeleted?.(results.succeededIds)
          }
        },
      },
    ]

    return items
  }

  function onContextMenu(_e: Event, row: TableRow<SerializedFile>): void {
    contextMenuItems.value = getRowItems(row)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
