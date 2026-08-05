export interface UTableInstance<T> extends ComponentPublicInstance {
  tableApi?: {
    getRowModel: () => {
      rows: Row<T>[]
    }
  }
}
