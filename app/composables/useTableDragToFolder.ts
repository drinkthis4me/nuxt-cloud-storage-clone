import type { Ref } from 'vue'
import type { SerializedFile } from '~~/shared/types/response/files'
import type { SortableDragEvent } from '~/types/sortable'
import type { UTableInstance } from '~/types/UTableInstance'

// TODO: add class to drop target
// const DROP_TARGET_CLASS = ['ring-2', 'ring-primary', 'bg-primary/15']

export function useTableDragToFolder(
  table: Ref<UTableInstance<SerializedFile> | null>,
  rowSelection: Ref<Record<string, boolean>>,
  onMoveFiles: (fileIds: string[], targetFolderId: string) => void | Promise<void>,
) {
  let draggedRowId: string | null = null
  let currentDropTargetEl: HTMLElement | null = null
  let currentDropTargetId: string | null = null
  let cancelled = false

  function getRowFromElement(el: Element | null): SerializedFile | null {
    if (!el) return null

    const tableApi = table.value?.tableApi
    if (!tableApi) return null

    const tr = el.closest('tr')
    const tbody = tr?.closest('tbody')
    if (!tr || !tbody) return null

    const rows = tableApi.getRowModel().rows
    const index = Array.from(tbody.children).indexOf(tr)
    return rows[index]?.original ?? null
  }

  function clearDropTarget() {
    // if (currentDropTargetEl) {
    //   currentDropTargetEl.classList.remove(...DROP_TARGET_CLASS)
    // }
    currentDropTargetEl = null
    currentDropTargetId = null
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      cancelled = true
      clearDropTarget()
    }
  }

  // function evaluateDropTarget(clientX: number, clientY: number) {
  //   // elementsFromPoint returns an array of elements stacked at this point (top to bottom)
  //   const elAtPoint = document.elementFromPoint(clientX, clientY)
  //   const targetTr = elAtPoint?.closest('tr') ?? null
  //   const droppedRow = getRowFromElement(targetTr)

  //   console.log(elAtPoint)
  //   console.log(targetTr)

  //   const isValidTarget = !!droppedRow
  //     && droppedRow.isFolder
  //     && !rowSelection.value[droppedRow.id]

  //   if (isValidTarget && targetTr) {
  //     if (currentDropTargetEl !== targetTr) {
  //       clearDropTarget()
  //       currentDropTargetEl = targetTr
  //       currentDropTargetId = droppedRow.id
  //       // currentDropTargetEl.classList.add(...DROP_TARGET_CLASS)
  //     }
  //   }
  //   else {
  //     clearDropTarget()
  //   }
  // }

  const sortableOptions = {
    animation: 0,
    sort: false, // Disable reordering. We only want drag-onto-folder detection.
    filter: 'button, input, [data-no-drag]', // don't start a drag from the checkbox column
    preventOnFilter: false, // let the checkbox's own click still fire normally

    onStart(evt: SortableDragEvent) {
      const row = getRowFromElement(evt.item)
      draggedRowId = row?.id ?? null
      cancelled = false

      document.addEventListener('keydown', onKeydown)
    },

    async onEnd(evt: SortableDragEvent) {
      document.removeEventListener('keydown', onKeydown)

      const droppedEl = evt.originalEvent?.target as HTMLElement
      const droppedRow = getRowFromElement(droppedEl)
      const targetId = droppedRow?.id ?? null
      if (!targetId) return

      const isValidTarget = !!droppedRow
        && droppedRow.isFolder // Only drop into folder
        && droppedRow.id !== draggedRowId // Not self
        && !rowSelection.value[droppedRow.id] // can't drop selection onto a folder that's itself selected

      if (isValidTarget) {
        currentDropTargetId = droppedRow.id
        currentDropTargetEl = droppedEl
      }

      const targetFolderId = currentDropTargetId
      const dropTargetEl = currentDropTargetEl
      const draggedId = draggedRowId
      const wasCancelled = cancelled

      clearDropTarget()
      draggedRowId = null
      cancelled = false

      if (!targetFolderId || !dropTargetEl || !draggedId || wasCancelled) return

      // Check drop point:
      // Confirm the release point is actually over the highlighted folder,
      // not just hovering over.
      const point = evt.originalEvent
      if (point && 'clientX' in point) {
        const elAtPoint = document.elementFromPoint(point.clientX, point.clientY)
        const droppedOnTarget = !!elAtPoint && dropTargetEl.contains(elAtPoint)
        if (!droppedOnTarget) return
      }

      // Handle multi-selection or single-item move
      const selectedIds = Object.keys(rowSelection.value).filter(id => rowSelection.value[id])
      const idsToMove = selectedIds.includes(draggedId) && selectedIds.length > 1
        ? selectedIds
        : [draggedId]

      // Call API
      await onMoveFiles(idsToMove, targetFolderId)
    },
  }

  return { sortableOptions }
}
