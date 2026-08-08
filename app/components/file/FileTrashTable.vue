<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SerializedFile } from '~~/shared/types/response/files'
import type { ComponentPublicInstance } from 'vue'
</script>

<script setup lang="ts">
import { Icon, UCheckbox, UTable } from '#components'
import { getFileIcon } from '~~/app/utils/getFileIcon'
import { isoToLocalDateTime } from '~~/app/utils/date'
import { formatFileSize } from '~~/app/utils/fileSize'
import { h, useTemplateRef } from 'vue'

const fileTrashTableStore = useFileTrashTableStore()
useAsyncData('trash-table', () => fileTrashTableStore.fetchFiles())

const columns: TableColumn<SerializedFile>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          table.toggleAllPageRowsSelected(!!value), // value: boolean | 'indeterminate'
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          row.toggleSelected(!!value), // value: boolean | 'indeterminate'
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
    accessorKey: 'deletedAt',
    header: 'Trashed Timestamp',
    cell: ({ row }) => {
      const formatted = isoToLocalDateTime(row.original.deletedAt)
      return h('span', {}, formatted)
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Modified',
    // meta: {
    //   class: {
    //     th: 'text-right',
    //     td: 'text-right font-medium',
    //   },
    // },
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

const table = useTemplateRef<ComponentPublicInstance>('trash-table')

const {
  rowSelection,
  getRowId,
  onSelect,
  deselectAll,
} = useTableSelection<SerializedFile>(table)

const {
  contextMenuItems,
  onContextMenu,
} = useTableContextMenu({ table: 'trash-bin' })
</script>

<template>
  <div
    class="flex-1 flex flex-col"
    @click.self="deselectAll"
  >
    <UContextMenu :items="contextMenuItems">
      <UTable
        ref="trash-table"
        v-model:row-selection="rowSelection"
        :data="fileTrashTableStore.files"
        :loading="fileTrashTableStore.isLoading"
        :columns="columns"
        :get-row-id="getRowId"
        :ui="{
          tr: 'cursor-pointer hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class=""
        @contextmenu="onContextMenu"
        @select="onSelect"
      />
    </UContextMenu>
  </div>
</template>
