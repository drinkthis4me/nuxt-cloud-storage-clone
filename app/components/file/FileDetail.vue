<script setup lang="ts">
import type { SharePermissionEnum } from '#shared/types/response/shareLink'
import type { SerializedFile } from '#shared/types/response/files'

const {
  permission,
  file,
  token,
} = defineProps<{
  permission: SharePermissionEnum
  file: SerializedFile
  token: string
}>()

const isSlideoverOpen = shallowRef(false)
function openSlideover() {
  isSlideoverOpen.value = true
}

const isMounted = useMounted()

const fileInfo = computed(() => [
  {
    label: 'Name',
    value: file.name,
    editable: permission === 'EDIT',
  },
  {
    label: 'Type',
    value: file.mimeType,
  },
  {
    label: 'Size',
    value: formatFileSize(file.size),
  },
  {
    label: 'Owner',
    value: file.ownerId,
  },
  {
    label: 'Created at',
    value: isMounted ? isoToLocalDateTime(file.createdAt) : file.createdAt,
  },
  {
    label: 'Last updated at',
    value: isMounted ? isoToLocalDateTime(file.updatedAt) : file.updatedAt,
  },
])

const iconName = computed(() => getFileIcon({
  name: file.name,
  isFolder: file.isFolder,
  mimeType: file.mimeType,
}))

const { download } = useShareLinkDownload(token)
</script>

<template>
  <div class="flex justify-center">
    <USlideover
      v-model:open="isSlideoverOpen"
      title="File information"
      :overlay="false"
      inset
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <div
            v-for="info in fileInfo"
            :key="info.label"
          >
            <div class="inline-flex items-center gap-4">
              {{ info.label }}
              <span v-if="info.editable">
                <UTooltip
                  text="Edit"
                  :delay-duration="0"
                >
                  <Icon
                    name="i-lucide-pen"
                    size="12"
                  />
                </UTooltip>
              </span>
            </div>
            <ClientOnly>
              <div>{{ info.value }}</div>
              <template #fallback>
                <div>{{ file.createdAt }}</div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </template>
    </USlideover>

    <div class="w-full max-w-120 flex flex-col gap-4 p-8 border border-gray-500 rounded-xl">
      <div class="flex justify-end">
        <UTooltip
          text="File information"
          :delay-duration="0"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="lg"
            icon="i-lucide-info"
            aria-label="Open file information panel"
            @click="openSlideover"
          />
        </UTooltip>
      </div>

      <div class="flex justify-center">
        <div class="w-[12em] h-[12em]">
          <Icon
            :name="iconName"
            size="12em"
          />
        </div>
      </div>

      <p class="text-center">
        {{ file.name }}
      </p>

      <div>
        <UButton
          label="Download"
          size="xl"
          block
          @click="download(file.id)"
        />
      </div>
    </div>
  </div>
</template>
