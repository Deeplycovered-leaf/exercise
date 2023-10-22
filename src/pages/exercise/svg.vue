<script lang="ts" setup>
import { OrganizationChart, mockData } from '~/composables'

onMounted(() => {
  // eslint-disable-next-line no-new
  new OrganizationChart({
    el: '#chart-container',
    originTreeData: mockData,
    // 节点点击事件
    nodeClickEvent(e, d) {
      // eslint-disable-next-line no-console
      console.log('当前节点的数据：', d)
    },
    config: {
      // 节点的横向距离
      dx: 200,
      // 节点的纵向距离
      dy: 170,
      // svg的viewBox的宽度
      width: 0,
      // svg的viewBox的高度
      height: 0,
      // 节点的矩形框宽度
      rectWidth: 170,
      // 节点的矩形框高度
      rectHeight: 70,
    },
  })
})
</script>

<template>
  <div id="chart-container" class="w-screen h-90vh" />
</template>

<style scoped>
</style>
