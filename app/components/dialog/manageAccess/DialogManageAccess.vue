<script lang="ts">
import type { TabsItem } from '@nuxt/ui'
</script>

<script setup lang="ts">
const props = defineProps<{
  fileId: string
  fileName: string
}>()

const emit = defineEmits<{
  close: [value: null]
}>()

const tabItems = [
  {
    id: 'users' as const,
    label: 'Users with access',
    icon: 'i-lucide-user-plus',
  },
  {
    id: 'links' as const,
    label: 'Links',
    icon: 'i-lucide-link',
  },
] satisfies TabsItem[]

const activeTab = ref('users')

const {
  shares,
  pending: shareListPending,
  refresh: refreshShareList,
} = useShareList(props.fileId)

const {
  links,
  pending: shareLinkListPending,
  refresh: refreshShareLinkList,
} = useShareLinkList(props.fileId)

// Make sure the list is up-to-date on dialog opened
onMounted(async () => {
  await Promise.all([
    () => refreshShareLinkList(),
    () => refreshShareList(),
  ])
})
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
        <h2 class="flex items-center gap-2 text-2xl capitalize">
          Manage access
          <Icon
            v-if=" shareListPending ||shareLinkListPending"
            name="i-lucide-loader-circle"
            class="animate-spin size-6"
          />
        </h2>

        <p class="text-sm text-dimmed mt-1">
          {{ fileName }}
        </p>
      </div>

      <div class="flex space-x-1">
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
      <div class="">
        <UTabs
          v-model="activeTab"
          :content="false"
          :items="tabItems"
          value-key="id"
          class="w-full"
        />
        <div class="overflow-hidden">
          <Transition
            name="tab-fade"
            mode="out-in"
          >
            <div :key="activeTab">
              <div v-if="activeTab === 'users'">
                <DialogManageAccessUserList
                  :file-id="fileId"
                  :shares
                  @refresh="refreshShareList"
                />
              </div>

              <div v-else-if="activeTab === 'links'">
                <div v-if="shareLinkListPending">
                  Loading...
                </div>

                <div v-else-if="!links || links.length === 0">
                  No share link for this file.
                </div>

                <DialogManageAccessLinkList
                  v-else
                  :file-id="fileId"
                  :links
                  @refresh="refreshShareLinkList"
                />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
