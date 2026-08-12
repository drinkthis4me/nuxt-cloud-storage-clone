<script setup lang="ts">
import { formatFileSize } from '~/utils/fileSize'

const { data, pending } = useFetch('/api/users/me/storage')

const progressValue = computed(() => {
  if (pending.value) return null

  const usage = Number(data.value?.usage ?? 0)
  const quota = Number(data.value?.quota ?? 0)

  return usage > 0 ? Math.floor(usage / quota) * 100 : 0
})

const label = computed(() => `${formatFileSize(data.value?.usage ?? '0')} of ${formatFileSize(data.value?.quota ?? '0')} used`)

const tooltipText = computed(() => `${progressValue.value} %`)
const tooltipOpen = shallowRef(false)
const anchor = ref({ x: 0, y: 0 })
const toolTipReference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value,
    } as DOMRect),
}))
</script>

<template>
  <div class="p-4">
    <UTooltip
      :text="tooltipText"
      :open="tooltipOpen"
      :reference="toolTipReference"
      :content="{ side: 'top', sideOffset: 16, updatePositionStrategy: 'always' }"
    >
      <div
        @pointerenter="tooltipOpen = true"
        @pointerleave="tooltipOpen = false"
        @pointermove="(ev: PointerEvent) => {
          anchor.x = ev.clientX
          anchor.y = ev.clientY
        }"
      >
        <UProgress :model-value="progressValue" />
        <div class="mt-2 flex justify-end items-center gap-1 text-muted">
          <Icon
            name="i-lucide-cloud"
            size="15px"
          />
          <p class="text-end text-xs">
            {{ label }}
          </p>
        </div>
      </div>
    </UTooltip>
  </div>
</template>
