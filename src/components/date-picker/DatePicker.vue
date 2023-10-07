<script lang="ts" setup>
import ListItem from './ListItem.vue'
import ScrollContainer from './ScrollContainer.vue'
import { DateMark, PROVIDE_KEYS } from './types'
import type { IData, IProps } from './types'
import { create_day_arr, create_month_arr } from './utils'

const props = defineProps<IProps>()
const emit = defineEmits(['dateChange'])
const month_arr = create_month_arr()

const data = reactive<IData>({
  current_date: props.currentDate,
  day_arr: create_day_arr(props.currentDate),
})

provide(PROVIDE_KEYS.DATA, {
  current_date: data.current_date,
  years: props.years,
  months: month_arr,
  days: data.day_arr,
})

function on_set_year(index: number) {
  data.current_date[0] = props.years[index]
  data.day_arr = create_day_arr(data.current_date)
  emit('dateChange', toRaw(data.current_date))
}

function on_set_month(index: number) {
  data.current_date[1] = month_arr[index]
  data.day_arr = create_day_arr(data.current_date)

  const last_day = data.day_arr[data.day_arr.length - 1]

  if (data.current_date[2] > last_day)
    data.current_date[2] = last_day

  emit('dateChange', toRaw(data.current_date))
}

function on_set_day(index: number) {
  data.current_date[2] = data.day_arr[index]
  emit('dateChange', toRaw(data.current_date))
}
</script>

<template>
  <div class="flex w-full h-full">
    <ScrollContainer :field="DateMark.YEAR" @set-year="on_set_year">
      <ListItem v-for="year in props.years" :key="year">
        {{ year }}
      </ListItem>
    </ScrollContainer>
    <ScrollContainer :field="DateMark.MONTH" @set-month="on_set_month">
      <ListItem v-for="month in month_arr" :key="month">
        {{ month }}
      </ListItem>
    </ScrollContainer>
    <ScrollContainer :field="DateMark.DAY" @set-day="on_set_day">
      <ListItem v-for="day in data.day_arr" :key="day">
        {{ day }}
      </ListItem>
    </ScrollContainer>
  </div>
</template>

<style scoped>

</style>
