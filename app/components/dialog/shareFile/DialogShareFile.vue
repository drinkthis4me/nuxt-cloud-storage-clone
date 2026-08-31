<script lang="ts">
import type { ShareLinkSchema } from '~~/shared/schemas/shareLink'
</script>

<script setup lang="ts">
import DialogShareFileSettingPanel from './DialogShareFileSettingPanel.vue'

const props = defineProps<{
  fileId: string
  fileName: string
}>()

const emit = defineEmits<{
  close: [value: null]
}>()

const linkSettings = ref<ShareLinkSchema>({
  permission: 'VIEW',
})

// Link settings in dialog
const overlay = useOverlay()
async function openConfigPanel() {
  const modal = overlay.create(DialogShareFileSettingPanel, {
    destroyOnClose: true,
  })

  const res = await modal.open({
    fileName: props.fileName,
    linkSettings: linkSettings.value,
  })

  if (res) {
    linkSettings.value = res
  }
}

// Generate/Copy link
const { isLoading, createShareLink } = useShareLink()
const toast = useToast()
const { copy } = useClipboard()
async function onCopyLinkClick() {
  const link = await createShareLink(props.fileId, linkSettings.value)

  if (link) {
    copy(link.url)
    toast.add({
      color: 'success',
      title: 'Link copied',
    })

    // Refresh useShareLinkList()
    // const key = getShareLinkKey(link.id)
    // refreshNuxtData(key)
  }
}
</script>

<template>
  <UModal
    :ui="{
      header: 'justify-between items-start',
      footer: 'justify-between',
    }"
    :close="false"
    scrollable
  >
    <template #header>
      <div class="flex-1">
        <h2 class="text-2xl text-wrap wrap-break-word">
          Share "{{ fileName }}"
        </h2>
      </div>

      <div class="flex space-x-1">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-settings"
          aria-label="Edit settings"
          @click="openConfigPanel"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          aria-label="Close"
          @click="emit('close', null)"
        />
      </div>
    </template>

    <template #body>
      <div>
        <h3 class="text-lg">
          Permission
        </h3>
        <ul class="mt-2 list-disc list-inside space-y-2">
          <li>
            <div class="inline-flex items-center gap-2">
              Anyone with the link: <span class="font-bold">{{ linkSettings.permission === 'VIEW' ? 'Can view' : 'Can edit' }}</span> <Icon
                :name="linkSettings.permission === 'VIEW' ? 'i-lucide-eye' : 'i-lucide-pen'"
              />
            </div>
          </li>
          <li v-if="linkSettings.password">
            <div class="inline-flex items-center gap-2">
              Password protected <Icon name="i-lucide-lock" />
            </div>
          </li>
          <li v-if="linkSettings.expiresAt">
            Link expires at: <span class="font-bold">{{ isoToLocalDateTime(linkSettings.expiresAt) }}</span>
          </li>
        </ul>

        <!-- TODO: add <input> and <ul> for user/email  -->
        <!-- TODO: add <ul> for user/email  -->
      </div>
    </template>

    <template #footer>
      <UButton
        label="Copy link"
        icon="i-lucide-link"
        variant="subtle"
        size="lg"
        :loading="isLoading"
        @click="onCopyLinkClick"
      />

      <UButton
        label="Close"
        size="lg"
        @click="emit('close', null)"
      />
    </template>
  </UModal>
</template>
