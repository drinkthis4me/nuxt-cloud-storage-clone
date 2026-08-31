<script lang="ts">
import type { ShareLinkSummary } from '#shared/types/response/shareLink'
</script>

<script setup lang="ts">
import DialogManageAccessConfirmDelete from './DialogManageAccessConfirmDelete.vue'
import DialogManageAccessLinkSetting from './DialogManageAccessLinkSetting.vue'

interface FormattedShareLinkSummary extends ShareLinkSummary {
  createdAtLocalDateTime: string
  url: string
}

const props = defineProps<{
  fileId: string
  links: ShareLinkSummary[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { getShareLinkUrl } = useShareLink()

const formattedLinks = computed<FormattedShareLinkSummary[]>(() =>
  props.links.map(link => ({
    ...link,
    createdAtLocalDateTime: isoToLocalDateTime(link.createdAt),
    url: getShareLinkUrl(link.token),
  })))

const { copy } = useClipboard()
const toast = useToast()
async function onCopy(url: string) {
  await copy(url)
  toast.add({
    id: url,
    color: 'success',
    title: 'Link copied',
  })
}

const overlay = useOverlay()
const {
  editShareLink,
  revokeShareLink,
} = useShareLink()

const loadingSettingButtonIds = ref<Set<string>>(new Set())
async function handleOpenLinkSettings(link: FormattedShareLinkSummary) {
  const modal = overlay.create(DialogManageAccessLinkSetting, {
    destroyOnClose: true,
  })

  const res = await modal.open({
    permission: link.permission,
    hasPassword: link.hasPassword,
    expiresAt: link.expiresAt,
  })

  if (res) {
    loadingSettingButtonIds.value.add(link.id)
    await editShareLink({ id: props.fileId, linkId: link.id }, res)
    emit('refresh')
    loadingSettingButtonIds.value.delete(link.id)
  }
}

const loadingDeleteButtonIds = ref<Set<string>>(new Set())
async function handleDeleteLink(linkId: string) {
  const modal = overlay.create(DialogManageAccessConfirmDelete, {
    destroyOnClose: true,
  })

  const res = await modal.open()

  if (res) {
    loadingDeleteButtonIds.value.add(linkId)
    await revokeShareLink({ id: props.fileId, linkId })
    emit('refresh')
    loadingDeleteButtonIds.value.delete(linkId)
  }
}
</script>

<template>
  <div class="flex flex-col divide-y-1 divide-neutral-500">
    <div
      v-for="link of formattedLinks"
      :key="link.id"
      class="flex justify-between items-center gap-x-2 px-2 py-4"
    >
      <Icon
        name="i-lucide-globe"
        size="28"
      />

      <div class="flex-1 flex flex-col gap-y-1">
        <div class="inline-flex items-center gap-2">
          <p>Created at: {{ link.createdAtLocalDateTime }}</p>

          <Icon
            v-if="link.hasPassword"
            name="i-lucide-lock"
            class="text-red-400"
          />

          <Icon
            v-if="link.expiresAt !== null"
            name="i-lucide-clock"
            class="text-yellow-500"
          />
        </div>
        <UFieldGroup>
          <UInput
            :model-value="link.url"
            readonly
            class="w-full"
            @focus="$event.target.select()"
          />

          <UButton
            icon="i-lucide-copy"
            variant="subtle"
            aria-label="Copy share link"
            @click="onCopy(link.url)"
          />
        </UFieldGroup>

        <div>Anyone with the link can <span class="font-bold lowercase">{{ link.permission }}</span></div>
      </div>

      <div class="flex items-center">
        <UButton
          icon="i-lucide-settings"
          size="lg"
          variant="ghost"
          color="neutral"
          :loading="loadingSettingButtonIds.has(link.id)"
          aria-label="Open link settings"
          @click="handleOpenLinkSettings(link)"
        />
        <UButton
          icon="i-lucide-trash-2"
          size="lg"
          variant="ghost"
          color="neutral"
          :loading="loadingDeleteButtonIds.has(link.id)"
          aria-label="Delete link"
          @click="handleDeleteLink(link.id)"
        />
      </div>
    </div>
  </div>
</template>
