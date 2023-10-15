<script lang="ts" setup>
import type { IProps, TouchingPosition } from './types'
import { DefaultConfigs, DefaultTips } from './types'
import { useState } from './useState'

const props = withDefaults(defineProps<IProps>(), {
  willPullTip: DefaultTips.WILL_PULL_TIP,
  pullingTip: DefaultTips.PULLING_TIP,
  loadingTip: DefaultTips.LOADING_TIP,
  tipColor: DefaultConfigs.TIP_COLOR,
  tipSize: DefaultConfigs.TIP_SIZE,
  bgColor: DefaultConfigs.BG_COLOR,
  loadingDuration: DefaultConfigs.LOADING_DURATION,
})

const emit = defineEmits<{
  (e: 'refreshing'): void
  (e: 'refreshed'): void
}>()

let loading = false

const state = useState()

const transitionStatus = computed(() => state.needTransition ? `height ${DefaultConfigs.TRANSITION_DURATION}s` : 'none')

const touchingPosition: TouchingPosition = {
  start: 0,
  end: 0,
}

function onTouchStart(e: TouchEvent) {
  const touch = e.changedTouches[0]
  touchingPosition.start = touch.clientY
}

function onTouchMove(e: TouchEvent) {
  if (!loading) {
    setRefreshShow(true)

    const touch = e.changedTouches[0]
    touchingPosition.end = touch.clientY
    const distance = touchingPosition.end - touchingPosition.start

    if (state.refreshHeight > DefaultConfigs.MIN_REFRESHING_HEIGHT)
      setTip(props.pullingTip)

    if (touchingPosition.start > touchingPosition.end)
      addRefreshHeight(distance)
    else
      addRefreshHeight(distance / 2)

    touchingPosition.start = touchingPosition.end
  }
}

function onTouchEnd() {
  setNeedTransition(true)

  if (state.refreshHeight < DefaultConfigs.MIN_REFRESHING_HEIGHT) {
    resetRefresh()
  }
  else {
    setRefresh()
    setTimeout(setRefreshed, props.loadingDuration)
  }
}

function resetRefresh() {
  setRefreshHeight(0)
  setTip(props.willPullTip)
  setLoading(false)
  closeRefreshArea()
}

function closeRefreshArea() {
  setTimeout(() => {
    setNeedTransition(false)
    setRefreshShow(false)
  }, DefaultConfigs.TRANSITION_DURATION * 1000)
}

function setRefresh() {
  setRefreshHeight(DefaultConfigs.MIN_REFRESHING_HEIGHT)
  setTip(DefaultTips.LOADING_TIP)
  setLoading(true)

  emit('refreshing')
}

function setRefreshed() {
  resetRefresh()

  emit('refreshed')
}

function setTip(tip: string) {
  state.refreshTip = tip
}

function setRefreshHeight(height: number) {
  state.refreshHeight = height
}

function addRefreshHeight(distance: number) {
  state.refreshHeight += distance
}

function setNeedTransition(status: boolean) {
  state.needTransition = status
}

function setRefreshShow(status: boolean) {
  state.refreshShow = status
}

function setLoading(status: boolean) {
  loading = status
}
</script>

<template>
  <div
    class="of-y-auto h-screen"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      v-show="state.refreshShow"
      class="refresh-wrapper flex justify-center items-center of-hidden"
      :style="{
        height: `${state.refreshHeight}px`,
        backgroundColor: props.bgColor,
        transition: transitionStatus,
      }"
    >
      <span
        :style="{
          color: props.tipColor,
          fontSize: `${props.tipSize}px`,
        }"
      >{{ state.refreshTip }}</span>
    </div>
    <div class="content-wrapper">
      <slot />
    </div>
  </div>
</template>
