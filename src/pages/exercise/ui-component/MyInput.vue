<script lang="ts" setup>
const _inputRef = ref(null)
onMounted(() => {
  // 实例方法透传
  // for (const [name, fn] of Object.entries(_inputRef.value)) {
  // }
})
</script>

<template>
  <div>
    <!-- 属性透传 -->
    <ElInput v-bind="$attrs" ref="_inputRef">
      <!-- 插槽透传 -->
      <template
        v-for="(_, slotName) in $slots" :key="slotName"
        #[slotName]="slotData"
      >
        <slot :name="slotName" v-bind="slotData || {}" />
      </template>
    </ElInput>
  </div>
</template>
