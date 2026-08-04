import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'

export const useTableContextMenu = () => {
  const contextMenuItems = ref<ContextMenuItem[]>([])

  const getRowItems = (_row: TableRow<SerializedFile>) => {
    return [
      {
        label: 'Download',
        icon: 'i-lucide-download',
        onSelect() {
        },
      },
      {
        label: 'Rename',
        icon: 'i-lucide-pen-line',
        onSelect() {
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
        color: 'error' as const,
        icon: 'i-lucide-trash',
        onSelect() {},
      },
    ]
  }

  const onContextMenu = (_e: Event, row: TableRow<SerializedFile>) => {
    contextMenuItems.value = getRowItems(row)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
