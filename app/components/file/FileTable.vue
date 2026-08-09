<script lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'
import type { ComponentPublicInstance } from 'vue'
</script>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import { Icon, UCheckbox, UTable } from '#components'
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
  moved: []
  renamed: [file: SerializedFile]
}>()

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
      const formatted = isoToLocalDateTime(row.original.updatedAt)
      return h('span', {}, formatted)
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
      const res = row.original.isFolder ? '' : formatFileSize(row.original.size)
      return h('span', {}, res)
    },
  },
]

const table = useTemplateRef<ComponentPublicInstance>('table')

const onRowDoubleClick = (row: TableRow<SerializedFile>) => {
  if (row.original.isFolder) {
    navigateTo(`/app/folders/${row.original.id}`)
  }
}

const {
  rowSelection,
  getRowId,
  onSelect,
  deselectAll,
} = useTableSelection<SerializedFile>(table, onRowDoubleClick)

const {
  contextMenuItems,
  onContextMenu,
} = useTableContextMenu({
  onRenamed: file => emit('renamed', file),
})

const { moveFiles } = useMoveFile()
const onMoveFiles = async (fileIds: string[], targetFolderId: string) => {
  await moveFiles(fileIds, targetFolderId)
  emit('moved')
}
const { sortableOptions } = useTableDragToFolder(table, rowSelection, onMoveFiles)
useSortable('.table-tbody-class-for-sortablejs', files, sortableOptions)
</script>

<template>
  <div
    class="flex-1 flex flex-col"
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
        :ui="{
          tbody: 'table-tbody-class-for-sortablejs',
          tr: 'cursor-pointer hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class=""
        @contextmenu="onContextMenu"
        @select="onSelect"
      />
    </UContextMenu>
  </div>
</template>
