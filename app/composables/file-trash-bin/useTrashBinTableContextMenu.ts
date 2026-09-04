import { resolveTargetRows } from '~/utils/resolveTargetRows'

import type { ShallowRef } from 'vue'
import type { SerializedFile } from '~~/shared/types/response/files'
import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { UTableInstance } from '~/types/UTableInstance'

interface useTrashBinTableContextMenuOptoins {
  tableRef?: Readonly<ShallowRef<UTableInstance<SerializedFile> | null>>
  rowSelection?: Ref<Record<string, boolean>>
  onHardDeleted?: (ids: SerializedFile['id'][]) => void
  onRestored?: (ids: SerializedFile['id'][]) => void
  onSelectionReplaced?: (rowId: string) => void
}

export function useTrashBinTableContextMenu(options: useTrashBinTableContextMenuOptoins) {
  const {
    tableRef,
    rowSelection = null,
    onHardDeleted,
    onRestored,
    onSelectionReplaced,
  } = options

  const contextMenuItems = shallowRef<ContextMenuItem[]>([])

  const { hardDelete } = useDeleteFile()
  const { restore } = useRestoreFile()

  function getRowItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows<SerializedFile>(rowSelection, row, allRows, onSelectionReplaced)
    const isMulti = targets.length > 1

    const items = [
      {
        label: isMulti ? `Restore ${targets.length} items` : 'Restore',
        icon: 'i-lucide-file-symlink',
        async onSelect() {
          const filesToRestore = targets.map(t => t.id)
          const result = await restore(filesToRestore)

          if (result && result.succeededIds.length > 0) {
            onRestored?.(result.succeededIds)
          }
        },
      },
      {
        label: isMulti ? `Permanently delete ${targets.length} items` : 'Permanent delete',
        color: 'error' as const,
        icon: 'i-lucide-trash-2',
        async onSelect() {
          const filesToDelete = targets.map(f => f.id)
          const results = await hardDelete(filesToDelete)

          if (results && results.succeededIds.length > 0) {
            onHardDeleted?.(results.succeededIds)
          }
        },
      },
    ]

    return items
  }

  function onContextMenu(_e: Event, row: TableRow<SerializedFile>): void {
    const allRows = tableRef?.value?.tableApi?.getRowModel().rows ?? [row]

    contextMenuItems.value = getRowItems(row, allRows)
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
