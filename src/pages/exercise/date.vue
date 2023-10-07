<script lang="ts" setup generic="T">
import DatePicker from '~/components/date-picker/DatePicker.vue'

const years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
const current_date = [2021, 2, 15]

function on_date_change(date: number[]) {
  // eslint-disable-next-line no-console
  console.log('date =>', date)
}
</script>

<template>
  <div>
    <DatePicker :years="years" :current-date="current_date" @date-change="on_date_change" />
  </div>
</template>

<style scoped>

</style>
