<script lang="ts">
import type { SelectItem, FormSubmitEvent } from '@nuxt/ui'
import type { ShareSummary } from '~~/shared/types/response/share'
import type { ShareSchema } from '~~/shared/schemas/share'
</script>

<script lang="ts" setup>
import { shareSchema } from '~~/shared/schemas/share'
import { sharePermission } from '~~/shared/const/share'

const props = defineProps<{
  fileId: string
  shares: ShareSummary[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const loading = shallowRef(false)
const formState = reactive<ShareSchema>({
  email: '',
  permission: sharePermission.VIEW,
})

const selectItems = [
  {
    label: 'Can view',
    icon: 'i-lucide-eye',
    value: sharePermission.VIEW,
  },
  {
    label: 'Can edit',
    icon: 'i-lucide-pen',
    value: sharePermission.EDIT,
  },
] satisfies SelectItem[]

const {
  create: createShare,
  revoke: revokeShare,
} = useShareFile()

async function onSubmit(e: FormSubmitEvent<ShareSchema>) {
  loading.value = true
  const res = await createShare(props.fileId, e.data)
  if (res) {
    emit('refresh')
    formState.email = ''
  }
  loading.value = false
}

const loadingShareId = ref<Set<string>>(new Set())
async function handleRevokeShare(shareId: string) {
  loadingShareId.value.add(shareId)
  const res = await revokeShare({
    id: props.fileId,
    shareId,
  })
  if (res) {
    emit('refresh')
  }
  loadingShareId.value.delete(shareId)
}
</script>

<template>
  <div class="py-4">
    <UForm
      :state="formState"
      :schema="shareSchema"
      :validate-on="['change']"
      class="flex flex-col gap-y-2"
      @submit="onSubmit"
    >
      <UFormField
        class="w-full"
        name="email"
      >
        <UFieldGroup class="w-full">
          <UInput
            v-model="formState.email"
            placeholder="Add an email to share"
            name="email"
            class="w-full"
          />

          <USelect
            v-model="formState.permission"
            :ui="{
              content: 'min-w-fit',
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            :items="selectItems"
          />
        </UFieldGroup>
      </UFormField>

      <div
        v-show="formState.email.length > 0"
        class="flex justify-end"
      >
        <UButton
          label="Send"
          type="submit"
          :disabled="formState.email.length === 0"
          :loading
          class="w-25 inline-flex justify-center items-center"
        />
      </div>
    </UForm>

    <!-- List -->
    <div class="mt-4 flex flex-col gap-y-4">
      <div
        v-for="share in shares"
        :key="share.id"
        class="flex items-center gap-2"
      >
        <UButton
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          :loading="loadingShareId.has(share.id)"
          :aria-label="`Remove access permission for ${share.inviteEmail}`"
          @click="handleRevokeShare(share.id)"
        />

        <div class="flex-1 flex items-center gap-2">
          <UAvatar
            color="neutral"
            size="lg"
            :alt="share.inviteEmail"
          />

          <div class="min-w-0 break-all">
            {{ share.inviteEmail }}
          </div>
        </div>

        <div class="">
          <UBadge
            :icon="share.permission ==='VIEW' ? 'i-lucide-eye': 'i-lucide-pen'"
            :color="share.permission ==='VIEW' ? 'info' : 'success'"
            variant="outline"
          >
            Can<span class="lowercase">{{ share.permission }}</span>
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>
