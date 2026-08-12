<script lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'
import type { UTableInstance } from '~/types/UTableInstance'
</script>

<script setup lang="ts">
import { Icon, UTable } from '#components'
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
  'file-deleted': [ids: SerializedFile['id'][]]
}>()

const { promptAndUploadFile } = useUploadFile()

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

const table = useTemplateRef<UTableInstance<SerializedFile>>('table')

const {
  contextMenuItems,
  onContextMenu: onContextMenuBase,
} = useTableContextMenu({
  onRenamed: () => emit('refresh'),
  onMoved: () => emit('refresh'),
  onSoftDeleted: ids => emit('file-deleted', ids),
})

function onContextMenu(e: Event, row: TableRow<SerializedFile>) {
  const tableApi = table.value?.tableApi
  const allRows = tableApi?.getRowModel().rows ?? [row]
  onContextMenuBase(e, row, allRows)
}
</script>

<template>
  <HeroEmpty
    v-if="!loading && files.length === 0"
    title="No files. Start uploading files."
  >
    <template #default>
      <UButton
        label=" Upload now"
        size="xl"
        class="capitalize"
        @click="promptAndUploadFile"
      />
    </template>
  </HeroEmpty>
  <div
    v-else
    class="flex-1 flex flex-col"
  >
    <UContextMenu :items="contextMenuItems">
      <UTable
        ref="table"
        :data="files"
        :columns="columns"
        :get-row-id="row => row.id"
        :loading="loading"
        :ui="{
          tr: 'cursor-pointer hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class="border-1 border-accented shadow-lg"
        @contextmenu="onContextMenu"
      />
    </UContextMenu>
  </div>
</template>
