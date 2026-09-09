<script setup lang="ts">
import type { UploadEntry } from '~/types/uploadEntry'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const store = useUploadQueueStore()
const { hasFileHandle } = useActiveFileHandles()
const uploads = computed<UploadEntry[]>(() =>
  Array.from(store.entries.values())
    .map(entry => ({
      ...entry,
      canResume: entry.status === 'paused' && hasFileHandle(entry.fileId),
    })),
)

const { pauseUpload } = usePauseUpload()
const { resumeUpload } = useResumeUpload()
const { cancelUpload } = useCancelUpload()
const { fetchFileDetail } = useFileDetail()

async function onNavigate(id: string) {
  const file = await fetchFileDetail(id)
  if (file === null) return

  const path = file.parentFolderId === null
    ? '/app/folders'
    : `/app/folders/${file.parentFolderId}`
  navigateTo(path)
}

onMounted(() => {
  store.hydrateFromServer()
})
</script>

<template>
  <UDashboardPanel id="uploading">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="text-base capitalize">
            Upload progress
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HeroEmpty
        v-if="uploads.length === 0"
        icon="i-lucide-circle-check-big"
        title="No upload in progress"
      >
        <template #default>
          <UButton
            label="Refresh"
            size="xl"
            :loading="store.isLoading"
            @click="store.hydrateFromServer()"
          />
        </template>
      </HeroEmpty>
      <UploadProgressList
        v-else
        :uploads
        @pause="pauseUpload"
        @resume="resumeUpload"
        @cancel="cancelUpload"
        @remove="store.remove"
        @navigate="onNavigate"
      />
    </template>
  </UDashboardPanel>
</template>
