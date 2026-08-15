<script lang="ts">
import type { UploadEntry } from '~/types/uploadEntry'
import type { DropdownMenuItem } from '@nuxt/ui'
</script>

<script setup lang="ts">
import { parseAbsoluteToLocal } from '@internationalized/date'

const props = defineProps<{
  uploads: UploadEntry[]
}>()

const emit = defineEmits<{
  pause: [id: string]
  resume: [id: string]
  cancel: [id: string]
  remove: [id: string]
  navigate: [id: string]
}>()

function getProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0

  return Math.round((current / total) * 100)
}

const formattedUploads = computed(() => {
  const sorted = props.uploads
    .toSorted((a, b) => {
      const aTime = parseAbsoluteToLocal(a.updatedAt)
      const bTime = parseAbsoluteToLocal(b.updatedAt)
      return -aTime.compare(bTime)
    })

  return sorted.map((u) => {
    const percentage = getProgressPercentage(u.uploadedBytes, u.totalBytes)
    const progressText = `${formatFileSize(u.uploadedBytes.toString())} of ${formatFileSize(u.totalBytes.toString())}`

    return {
      ...u,
      updatedAt: isoToLocalDateTime(u.updatedAt),
      progressPercentage: percentage,
      progressText,
    }
  })
})

function showProgressUI(status: UploadEntry['status']) {
  return status === 'done' || status === 'uploading' || status === 'paused'
}

interface Action extends DropdownMenuItem {
  key: string
  label: string
  icon: string
  disabled?: boolean
  tooltip: string
  onClick: () => void
}

type ActionName = 'pause' | 'resume' | 'remove' | 'cancel' | 'navigate' | 'retry'

function getActions(id: UploadEntry['fileId'], status: UploadEntry['status'], canResume: boolean): Action[] {
  const actions: Record<ActionName, Action> = {
    pause: {
      key: 'pause',
      label: 'Pause',
      icon: 'i-lucide-pause',
      color: 'primary',
      tooltip: 'Pause upload',
      onClick: () => emit('pause', id),
    },
    resume: {
      key: 'resume',
      label: 'Resume',
      icon: 'i-lucide-play',
      color: 'primary',
      tooltip: 'Resume upload',
      disabled: !canResume,
      onClick: () => canResume && emit('resume', id),
    },
    remove: {
      key: 'remove',
      label: 'Remove from history',
      icon: 'i-lucide-archive-x',
      color: 'neutral',
      tooltip: 'Remove from history',
      onClick: () => emit('remove', id),
    },
    cancel: {
      key: 'cancel',
      label: 'Cancel',
      icon: 'i-lucide-x',
      color: 'error',
      tooltip: 'Cancel upload',
      onClick: () => emit('cancel', id),
    },
    navigate: {
      key: 'navigate',
      label: 'Navigate to file',
      icon: 'i-lucide-arrow-right',
      color: 'neutral',
      tooltip: 'Navigate to file location',
      onClick: () => emit('navigate', id),
    },
    retry: {
      key: 'retry',
      label: 'Retry',
      icon: 'i-lucide-corner-up-left',
      color: 'neutral',
      tooltip: 'Retry upload',
      onClick: () => emit('resume', id),
    },
  }

  switch (status) {
    case 'done':
      return [actions.navigate, actions.remove]
    case 'uploading':
      return [actions.pause, actions.cancel]
    case 'paused':
      return [actions.resume, actions.cancel]
    case 'error':
      return [actions.retry, actions.remove]
    default: // 'cancelled'
      return [actions.remove]
  }
}

function getDropdownMenuItems(upload: UploadEntry): DropdownMenuItem[] {
  return getActions(upload.fileId, upload.status, upload.canResume ?? false)
    .map(action => ({
      label: action.label,
      icon: action.icon,
      color: action.color,
      onSelect: action.onClick,
    }))
}
</script>

<template>
  <div class="">
    <TransitionGroup
      name="fade"
      tag="div"
      class="relative space-y-4"
    >
      <div
        v-for="upload in formattedUploads"
        :key="upload.fileId"
        class="flex items-center gap-3 py-4 px-2 border border-black/50 dark:border-accented bg-background"
      >
        <!-- Info section -->
        <Icon
          :name="getFileIcon({ name: upload.name, isFolder: false, mimeType: upload.mimeType })"
          size="2em"
        />
        <div class="flex-1 truncate">
          <div class="text-wrap">
            {{ upload.name }}
          </div>
          <div class="text-sm text-muted text-wrap">
            <span class="capitalize">{{ upload.status }}</span> - {{ upload.updatedAt }}
          </div>
        </div>

        <!-- Progress bar section -->
        <template v-if="showProgressUI(upload.status)">
          <div class="hidden md:flex flex-col justify-between">
            <UProgress
              :model-value="upload.progressPercentage"
              class="w-48"
            />
            <p class="mt-1 text-right text-sm text-muted">
              {{ upload.progressText }}
            </p>
          </div>
          <span class="text-sm text-muted w-10 text-right">{{ upload.progressPercentage }}%</span>
        </template>

        <!-- Mobile dropdown (< md) -->
        <UDropdownMenu
          :items="getDropdownMenuItems(upload)"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8,
          }"
          :ui="{
            content: 'w-48',
          }"
        >
          <UButton
            icon="i-lucide-ellipsis"
            variant="ghost"
            class="md:hidden"
            aria-label="Open actions menu"
          />
        </UDropdownMenu>

        <!-- Desktop action buttons (>= md) -->
        <div class="hidden md:flex items-center gap-3">
          <template
            v-for="action in getActions(upload.fileId, upload.status, upload.canResume ?? false)"
            :key="action.key"
          >
            <UTooltip
              v-if="action.key === 'resume' && action.disabled"
              text="This file isn't selected in your browser anymore. Cancel and start a new upload."
            >
              <UButton
                :icon="action.icon"
                :color="action.color"
                aria-label="Resume unavailable, file not selected."
                variant="ghost"
                disabled
              />
            </UTooltip>

            <UTooltip
              v-else
              :text="action.tooltip"
            >
              <UButton
                :icon="action.icon"
                :color="action.color"
                :aria-label="action.label"
                variant="ghost"
                @click="action.onClick"
              />
            </UTooltip>
          </template>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-move {
  transition: transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}
</style>
