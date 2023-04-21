<script setup lang="ts" generic="T extends any, O extends any">
defineOptions({
  name: 'IndexPage',
})

const exerciseList = [
  {
    name: '字体阴影',
    path: '/font-shadow',
  },
  {
    name: '九宫格',
    path: '/sudoku',
  },
  {
    name: '音频可视化',
    path: '/audio-visual',
  },
  {
    name: 'UI组件封装',
    path: '/ui-component',
  },
  {
    name: '静态资源动态导入',
    path: '/dynamic-resource-import',
  },
].reverse()

const router = useRouter()

function go(path: string) {
  router.push(`/exercise${path}`)
}
</script>

<template>
  <div mx-a text-center>
    <div i-carbon-campsite text-4xl inline-block />
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse-lite" target="_blank">
        Vitesse Lite Exercise
      </a>
    </p>
    <p>
      <em text-sm op75>Opinionated Vite Starter Template</em>
    </p>

    <div flex flex-wrap flex-1>
      <button
        v-for="item in exerciseList" :key="item.name"
        class="m-3 text-md btn"
        @click="go(item.path)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>
