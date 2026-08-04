import { ref } from 'vue'

import type { TableRow } from '@nuxt/ui'
import type { ComponentPublicInstance } from 'vue'
import type { Row } from '@tanstack/vue-table'

interface UTableInstance<T> extends ComponentPublicInstance {
  tableApi?: {
    getRowModel: () => {
      rows: Row<T>[]
    }
  }
}

export const useTableSelection = <T>(table: Ref<UTableInstance<T> | null>) => {
  const rowSelection = ref<Record<string, boolean>>({})

  const lastSelectedRowId = ref<string | null>(null)

  const onSelect = (e: Event, row: TableRow<T>) => {
    const mouseEvent = e as MouseEvent

    if (mouseEvent.shiftKey && lastSelectedRowId.value) {
      selectRange(lastSelectedRowId.value, row.id)
      return
    }

    row.toggleSelected(!row.getIsSelected())

    lastSelectedRowId.value = row.id
  }

  const selectRange = (fromId: string, toId: string) => {
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

  const deselectAll = () => {
    rowSelection.value = {}
    lastSelectedRowId.value = null

    // TODO: esc to deselect
  }

  const getRowId = <T extends { id: string }>(row: T) => row.id

  return {
    rowSelection,
    onSelect,
    deselectAll,
    getRowId,
  }
}
