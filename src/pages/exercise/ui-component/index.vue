<script lang="ts" setup>
import MyInput from './MyInput.vue'

const inputValue = ref('')
const inputRef = ref(null)
</script>

<template>
  <div w-300px mx-a my-10>
    <MyInput ref="inputRef" v-model="inputValue" placeholder="地址" aria-placeholder="地址">
      <template #prepend>
        <i class="i-carbon-search" />
      </template>
      <template #append>
        <i class="i-carbon-time" />
      </template>
    </MyInput>
  </div>
</template>

<style scoped>

</style>
