import { ref } from 'vue'

import type { TableRow } from '@nuxt/ui'
import type { UTableInstance } from '~/types/UTableInstance'

interface UseTableSelectionOption<T> {
  doubleClickOnly?: boolean
  table: Ref<UTableInstance<T> | null>
  onRowDoubleClick?: (row: TableRow<T>) => void
}

export function useTableSelection<T>(option: UseTableSelectionOption<T>) {
  const {
    doubleClickOnly = false,
    table,
    onRowDoubleClick,
  } = option

  const rowSelection = ref<Record<string, boolean>>({})
  const lastSelectedRowId = ref<string | null>(null)
  let clickTimeout: NodeJS.Timeout | null = null

  function deselectAll() {
    rowSelection.value = {}
    lastSelectedRowId.value = null
  }

  function onSelect(e: Event, row: TableRow<T>) {
    const mouseEvent = e as MouseEvent

    if (clickTimeout) {
      // Double clicked
      clearTimeout(clickTimeout)
      clickTimeout = null

      deselectAll()
      onRowDoubleClick?.(row)
      return
    }

    // TODO: SSR safety
    clickTimeout = setTimeout(() => {
      if (!doubleClickOnly) {
        if (mouseEvent.shiftKey && lastSelectedRowId.value) {
          selectRange(lastSelectedRowId.value, row.id)
          return
        }

        row.toggleSelected(!row.getIsSelected())

        lastSelectedRowId.value = row.id
      }

      if (clickTimeout) {
        clearTimeout(clickTimeout)
        clickTimeout = null
      }
    }, 250)
  }

  function selectRange(fromId: string, toId: string) {
    const rows = table.value?.tableApi?.getRowModel().rows
    if (!rows) return

    const fromIndex = rows.findIndex(r => r.id === fromId)
    const toIndex = rows.findIndex(r => r.id === toId)
    if (fromIndex === -1 || toIndex === -1) return

    const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]

    const next: Record<string, boolean> = {}
    for (let i = start; i <= end; i++) {
      next[rows[i]!.id] = true
    }
    rowSelection.value = next
  }

  function getRowId<T extends { id: string }>(row: T) {
    return row.id
  }

  onMounted(() => {
    useEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        deselectAll()
      }
    })
  })

  return {
    rowSelection,
    onSelect,
    deselectAll,
    getRowId,
  }
}
