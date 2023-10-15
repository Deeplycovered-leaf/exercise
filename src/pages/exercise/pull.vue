<script lang="ts" setup>
import PullRefresh from '~/components/pull-refresh/PullRefresh.vue'

function onRefreshing() {
  // eslint-disable-next-line no-console
  console.log('数据更新中...')
}

function onRefreshed() {
  // eslint-disable-next-line no-console
  console.log('数据更新完成!')
}
</script>

<template>
  <div class="h-screen">
    <PullRefresh
      will-pull-tip="下来刷新"
      pulling-tip="释放更新"
      loading-tip="正在加载中"
      tip-color="red"
      :tip-size="16"
      bg-color="#ededed"
      :loading-duration="2000"
      @refreshing="onRefreshing"
      @refreshed="onRefreshed"
    >
      <ul>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
        <li>123</li><li>123</li><li>123</li>
      </ul>
    </PullRefresh>
  </div>
</template>

<style>
  body {
    overflow: hidden;
  }
</style>
