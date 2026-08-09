import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'

interface useTableContextMenuOption {
  table?: 'default' | 'trash-bin'
  onRenamed?: (file: SerializedFile) => void
}

export const useTableContextMenu = (options: useTableContextMenuOption = {}) => {
  const {
    table = 'default',
    onRenamed,
  } = options

  const contextMenuItems = ref<ContextMenuItem[]>([])

  const { download } = useDownloadFile()
  const { promptAndRename } = useRenameFile()
  const { softDelete, hardDelete } = useDeleteFile()
  const { restore } = useRestoreFile()

  const getRowItems = (row: TableRow<SerializedFile>): ContextMenuItem[] => {
    const downloadButton = {
      label: 'Download',
      icon: 'i-lucide-download',
      async onSelect() {
        download(row.id)
      },
    }

    const items = [
      // Only supports download single file, not folders (for now)
      ...(row.original.isFolder ? [] : [downloadButton]),
      {
        label: 'Rename',
        icon: 'i-lucide-pen-line',
        async onSelect() {
          const updated = await promptAndRename(row.original.id, row.original.name)
          if (updated) {
            onRenamed?.(updated)
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
        onSelect() {
          softDelete(row.original.id)
        },
      },
    ]

    return items
  }

  const getTrashRowItems = (row: TableRow<SerializedFile>): ContextMenuItem[] => {
    return [
      {
        label: 'Restore',
        icon: 'i-lucide-file-symlink',
        async onSelect() {
          restore(row.original.id)
        },
      },
      {
        label: 'Permanent delete',
        color: 'error' as const,
        icon: 'i-lucide-trash-2',
        async onSelect() {
          hardDelete(row.original.id, row.original.name)
        },
      },
    ]
  }

  const onContextMenu = (_e: Event, row: TableRow<SerializedFile>): void => {
    contextMenuItems.value = table === 'default'
      ? getRowItems(row)
      : getTrashRowItems(row)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
