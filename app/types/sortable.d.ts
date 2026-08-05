export interface SortableDragEvent {
  to: HTMLElement
  from: HTMLElement
  item: HTMLElement
  clone: HTMLElement
  oldIndex: number | undefined
  newIndex: number | undefined
  oldDraggableIndex: number | undefined
  newDraggableIndex: number | undefined
  pullMode: 'clone' | boolean | undefined
  originalEvent?: MouseEvent | TouchEvent | PointerEvent | DragEvent
  explicitOriginalTarget: HTMLElement
}

export interface SortableMoveEvent {
  to: HTMLElement
  from: HTMLElement
  dragged: HTMLElement
  draggedRect: DOMRect
  related: HTMLElement
  willInsertAfter: boolean
  originalEvent?: MouseEvent | TouchEvent | PointerEvent | DragEvent
}
