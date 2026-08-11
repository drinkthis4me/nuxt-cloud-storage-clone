<script setup lang="ts">
import DialogMoveFileBreadcrumbs from './DialogMoveFileBreadcrumbs.vue'
import DialogMoveFileTable from './DialogMoveFileTable.vue'

const props = defineProps<{
  name: string
  parentFolderId: string | null
  movingIds: string[]
}>()

const emit = defineEmits<{
  close: [value: { newParentFolderId: string | null } | null]
}>()

const currentParentFolderId = shallowRef<string | null>(props.parentFolderId)
const isInvalidTarget = computed(() =>
  props.movingIds.includes(currentParentFolderId.value ?? '')
  || breadcrumbs.value.some(b => props.movingIds.includes(b.id)),
)

// Modal
const title = computed(() => `Moving "${props.name}"`)
const onClose = () => {
  emit('close', null)
}
const onMoveClick = () => {
  const payload = {
    newParentFolderId: currentParentFolderId.value ?? null,
  }
  emit('close', payload)
}

// Breadcrumbs
const {
  breadcrumbs,
  isRefreshing,
  error: breadcrumbsError,
} = useBreadcrumbs(currentParentFolderId)
const notFound = computed(() => currentParentFolderId.value !== null && !!breadcrumbsError.value)
const handleChangeFolder = async (newId: string | null) => {
  currentParentFolderId.value = newId
}

// Table
const {
  files,
  isPending,
  refresh,
} = useFolderContents(currentParentFolderId)

// Create new folder
const { promptAndCreateFolder } = useCreateFolder()
const onCreateFolderClick = async () => {
  await promptAndCreateFolder(currentParentFolderId.value)
  refresh()
}
</script>

<template>
  <UModal
    :ui="{
      title: 'text-2xl',
      footer: 'justify-between',
    }"
    :close="{ onClick: () => onClose() }"
    :title
    fullscreen
  >
    <template #body>
      <div>
        <div :class="{ 'opacity-60': isRefreshing }">
          <DialogMoveFileBreadcrumbs
            v-if="!notFound"
            :breadcrumbs
            :is-refreshing="isRefreshing"
            @change-folder="handleChangeFolder"
          />
          <p
            v-else
            class="text-sm text-muted"
          >
            This folder is no longer available.
          </p>
        </div>
        <div class="mt-4">
          <DialogMoveFileTable
            :files
            :loading="isPending"
            @change-folder="handleChangeFolder"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div>
        <UButton
          label="New folder"
          variant="outline"
          size="lg"
          @click="onCreateFolderClick"
        />
      </div>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          label="Cancel"
          size="lg"
          @click="onClose"
        />
        <UButton
          label="Move to here"
          size="lg"
          :disabled="isInvalidTarget"
          @click="onMoveClick"
        />
      </div>
    </template>
  </UModal>
</template>
