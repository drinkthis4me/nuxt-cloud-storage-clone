<script lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'
import type { UTableInstance } from '~/types/UTableInstance'
</script>

<script setup lang="ts">
import { Icon, UTable, UButton } from '#components'
import { getFileIcon } from '~~/app/utils/getFileIcon'
import { isoToLocalDateTime } from '~~/app/utils/date'
import { h, useTemplateRef } from 'vue'

const {
  files = [],
  loading,
} = defineProps<{
  files?: SerializedFile[]
  loading: boolean
}>()

const emit = defineEmits<{
  'change-folder': [value: string | null]
}>()

const columns: TableColumn<SerializedFile>[] = [
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
        h(Icon, { name: icon, class: 'mr-2 size-8' }),
        name,
      ])
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Modified',
    cell: ({ row }) => {
      const formatted = isoToLocalDateTime(row.original.updatedAt)
      return h('span', {}, formatted)
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
            ariaLabel: 'navigate to folder',
            onClick: () => {
              onRowDoubleClick(row)
            },
          })
        : h('span')
    },
  },
]

const table = useTemplateRef<UTableInstance<SerializedFile>>('table')

function onRowDoubleClick(row: TableRow<SerializedFile>) {
  if (row.original.isFolder) {
    emit('change-folder', row.original.id)
  }
}

const {
  getRowId,
  onSelect,
} = useTableSelection<SerializedFile>({
  doubleClickOnly: true,
  table,
  onRowDoubleClick,
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <UTable
      ref="table"
      :data="files"
      :columns="columns"
      :get-row-id="getRowId"
      :loading="loading"
      :ui="{
        tr: 'cursor-pointer hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
      }"
      @select="onSelect"
    />
  </div>
</template>
