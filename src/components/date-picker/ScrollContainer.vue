<script lang="ts" setup generic="T">
import ListItem from './ListItem.vue'
import { DateMark, PROVIDE_KEYS } from './types'
import type { IInjection, ScrollContainerProps } from './types'

const props = defineProps<ScrollContainerProps>()
const emit = defineEmits(['setYear', 'setMonth', 'setDay'])

const { current_date, years, months, days } = inject(PROVIDE_KEYS.DATA) as IInjection
const wrapper_ref = ref<HTMLElement>()

onMounted(() => {
  init_current_date()
})

function on_scroll_end() {
  const index = wrapper_ref.value!.scrollTop / 50

  switch (props.field) {
    case DateMark.YEAR:
      emit('setYear', index)
      break

    case DateMark.MONTH:
      emit('setMonth', index)
      break

    case DateMark.DAY:
      emit('setDay', index)
      break

    default:
      break
  }
}

function init_current_date() {
  let index = 0

  switch (props.field) {
    case DateMark.YEAR:
      index = years.indexOf(current_date[0])
      break
    case DateMark.MONTH:
      index = months.indexOf(current_date[1])
      break
    case DateMark.DAY:
      index = days.indexOf(current_date[2])
      break
    default:
      break
  }

  set_scroll(wrapper_ref.value!, index)
}

function set_scroll(wrapper: HTMLElement, index: number): void {
  wrapper.scrollTo(0, index * 50)
}
</script>

<template>
  <div class="scroll-container relative w-full h-full">
    <div class="target-center absolute top-100px left-0 z--1 w-full h-50px b-t b-b b-#ddd " />
    <div
      class="mask absolute left-0 top-0 z-1 w-full h-full pointer-events-none"
    />
    <div
      ref="wrapper_ref"
      class="wrapper of-y-auto h-250px snap-mandatory snap-y"
      @scrollend="on_scroll_end"
    >
      <div>
        <ListItem />
        <ListItem />
        <slot />
        <ListItem />
        <ListItem />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask {
  background-image: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 1),
    hsla(0, 0%, 100%, 0.8),
    hsla(0, 0%, 100%, 0),
    hsla(0, 0%, 100%, 0.8),
    hsla(0, 0%, 100%, 1)
  );
}

::-webkit-scrollbar {
  display: none;
}
</style>
