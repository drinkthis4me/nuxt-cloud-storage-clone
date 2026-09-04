import type { TableRow } from '@nuxt/ui'

export function resolveTargetRows<T>(
  rowSelection: Ref<Record<string, boolean>> | null,
  row: TableRow<T>,
  allRows: TableRow<T>[],
  onSelectionReplaced: ((rowId: string) => void) | undefined,
) {
  if (rowSelection === null) {
    return [row.original]
  }

  const isRowInSelection = !!rowSelection.value[row.id]

  if (isRowInSelection) {
    const selectedIds = new Set(Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))
    return allRows
      .filter(r => selectedIds.has(r.id))
      .map(r => r.original)
  }

  onSelectionReplaced?.(row.id)
  return [row.original]
}
