<script lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'
import type { UTableInstance } from '~/types/UTableInstance'
</script>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import { Icon, UCheckbox, UTable, UButton } from '#components'
import { getFileIcon } from '~~/app/utils/getFileIcon'
import { isoToLocalDateTime } from '~~/app/utils/date'
import { formatFileSize } from '~~/app/utils/fileSize'
import { h, useTemplateRef } from 'vue'

const {
  files = [],
  loading,
} = defineProps<{
  files?: SerializedFile[]
  loading: boolean
}>()

const emit = defineEmits<{
  'refresh': []
  'file-updated': [file: SerializedFile]
  'file-deleted': [fileIds: SerializedFile['id'][]]
}>()

const isMounted = useMounted()

const columns: TableColumn<SerializedFile>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          table.toggleAllPageRowsSelected(!!value), // value:  boolean | 'indeterminate'
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          row.toggleSelected(!!value), // value:  boolean | 'indeterminate'
        'aria-label': 'Select row',
        'onClick': (e: Event) => e.stopPropagation(),
      }),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.original.name
      const icon = getFileIcon({
        name: row.original.name,
        isFolder: row.original.isFolder,
        mimeType: row.original.mimeType,
      })
      return h('span', { class: 'flex items-center' }, [
        h(Icon, { name: icon, class: 'mr-2 aspect-square w-8 h-8' }),
        name,
      ])
    },
  },
  {
    accessorKey: 'mimeType',
    header: 'Type',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Modified',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right font-medium',
      },
    },
    cell: ({ row }) => {
      const dateString = row.original.updatedAt
      const formatted = isMounted ? isoToLocalDateTime(dateString) : dateString
      return h('span', {}, formatted)
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
      return row.original.isFolder
        ? null
        : h('span', {}, formatFileSize(row.original.size))
    },
  },
  {
    id: 'folder-navigate',
    header: 'Navigate',
    meta: {
      class: {
        th: 'text-center',
        td: 'flex justify-center items-center',
      },
    },
    cell: ({ row }) => {
      return row.original.isFolder
        ? h(UButton, {
            icon: 'i-lucide-arrow-right',
            color: 'neutral',
            variant: 'ghost',
            class: 'cursor-pointer',
            onClick: () => {
              onRowDoubleClick(row)
            },
          })
        : null
    },
  },
]

const table = useTemplateRef<UTableInstance<SerializedFile>>('table')

function onRowDoubleClick(row: TableRow<SerializedFile>) {
  if (row.original.isFolder) {
    navigateTo(`/app/folders/${row.original.id}`)
  }
}

const {
  rowSelection,
  getRowId,
  onSelect,
  deselectAll,
} = useTableSelection<SerializedFile>({
  table,
  onRowDoubleClick,
})

const {
  contextMenuItems,
  onContextMenu,
} = useMyFileTableContextMenu({
  tableRef: table,
  rowSelection,
  onRenamed: file => emit('file-updated', file),
  onSoftDeleted: ids => emit('file-deleted', ids),
  onSelectionReplaced: (rowId) => {
    rowSelection.value = { [rowId]: true }
  },
  onMoved: () => emit('refresh'),
})

const { moveFiles } = useMoveFile()
async function onMoveFiles(fileIds: string[], targetFolderId: string) {
  await moveFiles(fileIds, targetFolderId)
  emit('refresh')
}
const { sortableOptions } = useTableDragToFolder(table, rowSelection, onMoveFiles)
useSortable('.table-tbody-class-for-sortablejs', files, sortableOptions)
</script>

<template>
  <div
    class="flex flex-col"
    @click.self="deselectAll"
  >
    <UContextMenu :items="contextMenuItems">
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="files"
        :columns="columns"
        :get-row-id="getRowId"
        :loading="loading"
        empty="No files"
        :ui="{
          tbody: 'table-tbody-class-for-sortablejs',
          tr: 'cursor-pointer hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class="border-1 border-accented shadow-lg"
        @contextmenu="onContextMenu"
        @select="onSelect"
      />
    </UContextMenu>
  </div>
</template>
