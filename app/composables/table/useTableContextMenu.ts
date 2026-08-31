import type { Ref } from 'vue'
import type { ContextMenuItem, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'

interface useTableContextMenuOption {
  table?: 'default' | 'trash-bin' | 'recent' | 'shared-by-me' | 'shared-with-me'
  rowSelection?: Ref<Record<string, boolean>>
  onRenamed?: (file: SerializedFile) => void
  onSoftDeleted?: (ids: SerializedFile['id'][]) => void
  onHardDeleted?: (ids: SerializedFile['id'][]) => void
  onRestored?: (ids: SerializedFile['id'][]) => void
  onSelectionReplaced?: (rowId: string) => void
  onMoved?: () => void
}

export function useTableContextMenu(options: useTableContextMenuOption = {}) {
  const {
    table = 'default',
    rowSelection = null,
    onRenamed,
    onSoftDeleted,
    onHardDeleted,
    onRestored,
    onSelectionReplaced,
    onMoved,
  } = options

  const contextMenuItems = shallowRef<ContextMenuItem[]>([])

  const { download } = useDownloadFile()
  const { promptAndRename } = useRenameFile()
  const { promptAndMove } = useMoveFile()
  const { softDelete, hardDelete } = useDeleteFile()
  const { restore } = useRestoreFile()
  const { openDialog: openShareDialog } = useShareLink()
  const { openDialog: openManageAccessDialog } = useManageAccess()

  function resolveTargetRows(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]) {
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

  function getRowItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows(row, allRows)
    const isMulti = targets.length > 1
    const anyFolder = targets.some(t => t.isFolder)

    const downloadButton = {
      label: isMulti ? `Download ${targets.length} files` : 'Download',
      icon: 'i-lucide-download',
      async onSelect() {
        await Promise.all(targets.map(t => download(t.id)))
      },
    }

    const renameButton = {
      label: 'Rename',
      icon: 'i-lucide-pen-line',
      async onSelect() {
        const updated = await promptAndRename(targets[0]!.id, targets[0]!.name)
        if (updated) {
          onRenamed?.(updated)
        }
      },
    }

    const shareButton = {
      label: 'Share',
      icon: 'i-lucide-file-output',
      onSelect() {
        openShareDialog({
          fileId: row.original.id,
          fileName: row.original.name,
        })
      },
    }

    const manageAccessButton = {
      label: 'Manage access',
      icon: 'i-lucide-user-plus',
      onSelect() {
        openManageAccessDialog({
          fileId: row.original.id,
          fileName: row.original.name,
        })
      },
    }

    const items = [
      // Only supports download single file, not folders (for now)
      ...(anyFolder ? [] : [downloadButton]),
      // Only rename a single target
      ...(isMulti ? [] : [renameButton]),
      {
        label: isMulti ? `Move ${targets.length} items to` : 'Move to',
        icon: 'i-lucide-folder-input',
        async onSelect() {
          const filesToMove = targets.map(t => ({ id: t.id, name: t.name }))
          const currentParentFolderId = targets[0]?.parentFolderId ?? null
          const result = await promptAndMove(filesToMove, currentParentFolderId)

          if (result && result.succeededIds.length > 0) {
            onMoved?.()
          }
        },
      },
      {
        type: 'separator' as const,
      },
      ...(isMulti ? [] : [{ label: 'Info', icon: 'i-lucide-info' }]),
      ...(isMulti ? [] : [shareButton]),
      ...(isMulti ? [] : [manageAccessButton]),
      {
        type: 'separator' as const,
      },
      {
        label: isMulti ? `Move ${targets.length} items to trash` : 'Move to trash bin',
        icon: 'i-lucide-trash',
        async onSelect() {
          const filesToDelete = targets.map(f => f.id)
          const results = await softDelete(filesToDelete)

          if (results && results.succeededIds.length > 0) {
            onSoftDeleted?.(results.succeededIds)
          }
        },
      },
    ]

    return items
  }

  function getTrashRowItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows(row, allRows)
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

  function getRecentRowItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows(row, allRows)
    const isMulti = targets.length > 1

    const renameButton = {
      label: 'Rename',
      icon: 'i-lucide-pen-line',
      async onSelect() {
        const updated = await promptAndRename(targets[0]!.id, targets[0]!.name)
        if (updated) {
          onRenamed?.(updated)
        }
      },
    }
    const items = [
      {
        label: 'Download',
        icon: 'i-lucide-download',
        async onSelect() {
          await Promise.all(targets.map(t => download(t.id)))
        },
      },
      ...(isMulti ? [] : [renameButton]),
      {
        label: 'Move to',
        icon: 'i-lucide-pen-line',
        async onSelect() {
          const filesToMove = targets.map(t => ({ id: t.id, name: t.name }))
          const currentParentFolderId = targets[0]?.parentFolderId ?? null
          const result = await promptAndMove(filesToMove, currentParentFolderId)

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
      ...(isMulti ? [] : [{ label: 'Info', icon: 'i-lucide-info' }]),
      {
        type: 'separator' as const,
      },
      {
        label: isMulti ? `Move ${targets.length} items to trash` : 'Move to trash bin',
        icon: 'i-lucide-trash',
        async onSelect() {
          const filesToDelete = targets.map(f => f.id)
          const results = await softDelete(filesToDelete)

          if (results && results.succeededIds.length > 0) {
            onSoftDeleted?.(results.succeededIds)
          }
        },
      },
    ]

    return items
  }

  function getSharedByMeItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows(row, allRows)

    const items = [
      {
        label: 'Share',
        icon: 'i-lucide-user-plus',
        onSelect() {
          openShareDialog({
            fileId: row.original.id,
            fileName: row.original.name,
          })
        },
      },
      {
        label: 'Manage access',
        icon: 'i-lucide-user-plus',
        onSelect() {
          openManageAccessDialog({
            fileId: row.original.id,
            fileName: row.original.name,
          })
        },
      },
      {
        label: 'Download',
        icon: 'i-lucide-download',
        async onSelect() {
          await Promise.all(targets.map(t => download(t.id)))
        },
      },
    ] satisfies ContextMenuItem[]

    return items
  }

  function getSharedWithMeItems(row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): ContextMenuItem[] {
    const targets = resolveTargetRows(row, allRows)

    const items = [
      {
        label: 'Download',
        icon: 'i-lucide-download',
        async onSelect() {
          await Promise.all(targets.map(t => download(t.id)))
        },
      },
    ] satisfies ContextMenuItem[]

    return items
  }

  function onContextMenu(_e: Event, row: TableRow<SerializedFile>, allRows: TableRow<SerializedFile>[]): void {
    switch (table) {
      case 'trash-bin': {
        contextMenuItems.value = getTrashRowItems(row, allRows)
        break
      }
      case 'recent': {
        contextMenuItems.value = getRecentRowItems(row, allRows)
        break
      }
      case 'shared-by-me': {
        contextMenuItems.value = getSharedByMeItems(row, allRows)
        break
      }
      case 'shared-with-me': {
        contextMenuItems.value = getSharedWithMeItems(row, allRows)
        break
      }
      default: {
        contextMenuItems.value = getRowItems(row, allRows)
      }
    }
  }

  return {
    contextMenuItems,
    onContextMenu,
  }
}
