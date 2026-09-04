<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SerializedFile } from '#shared/types/response/files'
</script>

<script setup lang="ts">
import { Icon, UTable, UAvatar } from '#components'
import { getFileIcon } from '~~/app/utils/getFileIcon'
import { isoToLocalDateTime } from '~~/app/utils/date'
import { formatFileSize } from '~~/app/utils/fileSize'
import { h } from 'vue'

const {
  files = [],
  loading,
} = defineProps<{
  files?: SerializedFile[]
  loading: boolean
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
    accessorKey: 'ownerId',
    header: 'Owner',
    cell: () => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UAvatar, {
          src: 'https://i.pravatar.cc/300?u=123',
          loading: 'lazy',
          size: 'lg',
        }),
      ])
    },
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

const {
  contextMenuItems,
  onContextMenu,
} = useSharedWithMeTableContextMenu()
</script>

<template>
  <div class="flex flex-col">
    <UContextMenu :items="contextMenuItems">
      <UTable
        ref="table"
        :data="files"
        :columns="columns"
        :get-row-id="row => row.id"
        :loading="loading"
        empty="No files"
        :ui="{
          tr: 'hover:bg-elevated/50 data-[selected=true]:bg-primary/10 hover:data-[selected=true]:bg-primary/15',
        }"
        class="border-1 border-accented shadow-lg"
        @contextmenu="onContextMenu"
      />
    </UContextMenu>
  </div>
</template>
