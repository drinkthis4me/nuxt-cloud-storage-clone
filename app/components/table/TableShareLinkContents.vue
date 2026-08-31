<script lang="ts">
import type { SharePermissionEnum } from '#shared/types/response/shareLink'
import type { SerializedFile } from '#shared/types/response/files'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { UTableInstance } from '~/types/UTableInstance'
</script>

<script setup lang="ts">
import { Icon, UTable, UButton } from '#components'
import { getFileIcon } from '~~/app/utils/getFileIcon'
import { isoToLocalDateTime } from '~~/app/utils/date'
import { formatFileSize } from '~~/app/utils/fileSize'
import { h, useTemplateRef } from 'vue'

const {
  // permission,
  files,
  loading,
  token,
} = defineProps<{
  permission: SharePermissionEnum
  files: SerializedFile[]
  loading: boolean
  token: string
}>()

const { download } = useShareLinkDownload(token)

const route = useRoute()
function navigateToFolder(row: TableRow<SerializedFile>) {
  if (row.original.isFolder) {
    navigateTo({
      path: route.path,
      query: {
        folder: row.original.id,
      },
    })
  }
}

const columns = computed<TableColumn<SerializedFile>[]>(() => [
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
  {
    id: 'download',
    header: 'Download',
    cell: ({ row }) => {
      return h(UButton, {
        label: 'Download',
        icon: 'i-lucide-download',
        variant: 'outline',
        class: 'cursor-pointer',
        onClick() {
          download(row.original.id)
        },
      })
    },
  },
  {
    id: 'folder-navigate',
    header: 'Navigation',
    meta: {
      class: {
        th: 'text-center',
        td: 'flex justify-center items-center',
      },
    },
    cell: ({ row }) => {
      const isFolder = row.original.isFolder
      return isFolder
        ? h(UButton, {
            icon: 'i-lucide-arrow-right',
            color: 'neutral',
            variant: 'ghost',
            class: 'cursor-pointer',
            onClick() {
              navigateToFolder(row)
            },
          })
        : ''
    },
  },
])

const table = useTemplateRef<UTableInstance<SerializedFile>>('table')

const {
  rowSelection,
  getRowId,
  onSelect,
  deselectAll,
} = useTableSelection<SerializedFile>({
  table,
  onRowDoubleClick: navigateToFolder,
})

const {
  contextMenuItems,
  onContextMenu: onContextMenuBase,
} = useTableContextMenu({
  table: 'shared-by-me',
})

function onContextMenu(e: Event, row: TableRow<SerializedFile>) {
  const tableApi = table.value?.tableApi
  const allRows = tableApi?.getRowModel().rows ?? [row]
  onContextMenuBase(e, row, allRows)
}
</script>

<template>
  <div
    class="flex justify-center"
    @click.self="deselectAll"
  >
    <UContextMenu :items="contextMenuItems">
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="files"
        :columns="columns"
        :get-row-id="getRowId"
        :loading
        empty="No files"
        :ui="{
          tr: 'hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class="w-full border-1 border-accented shadow-lg"
        @contextmenu="onContextMenu"
        @select="onSelect"
      />
    </UContextMenu>
  </div>
</template>
