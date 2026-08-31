<script setup lang="ts">
import { getLocalTimeZone, CalendarDate, toZoned } from '@internationalized/date'

const props = defineProps<{
  date?: string | null // ISO 8601 string
  disabled?: boolean
}>()

const emits = defineEmits<{
  'update:date': [value: string | null]
}>()

const locale = 'zh-tw'
const open = shallowRef(false)

const inputDate = useTemplateRef('inputDate')

const modelValue = computed({
  get: () => {
    if (!props.date) return null

    const jsDate = new Date(props.date)

    // Get the year, month, and date, using local time
    return new CalendarDate(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate(),
    )
  },
  set: (val) => {
    if (!val) {
      emits('update:date', null)
    }
    else {
      const isoDateString = toZoned(val, getLocalTimeZone()).toAbsoluteString()
      emits('update:date', isoDateString)
    }
    open.value = false
  },
})

function clear() {
  emits('update:date', null)
  open.value = false
}
</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="modelValue"
    :disabled
    :locale
  >
    <template #trailing>
      <UPopover
        v-model:open="open"
        :content="{ align: 'start' }"
        :reference="inputDate?.inputsRef[3]?.$el"
      >
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          :disabled
          aria-label="Select a date"
          class="px-0"
        />

        <template #content>
          <div class="">
            <UCalendar
              v-model="modelValue"
              class="p-2"
            />

            <div class="p-2">
              <UButton
                label="Clear"
                variant="outline"
                block
                @click="clear"
              />
            </div>
          </div>
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
