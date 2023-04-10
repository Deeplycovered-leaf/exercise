<script lang="ts" setup>
/**
 * vite vue 静态资源动态导入
 * 1. 显示导入img
 *  import img1 from '../../assets/img/1.jpg'
 *  <img :src="img1" />
 * 2. 将图片移至public文件夹
 *  会丢失文件指纹，导致其文件名不会改变，
 *  如若将来替换图片
 *  像静态资源这种图片，用户会缓存相当长时间
 *  文件名不变，其不会读取新文件内容
 *  3. 异步动态导入
 *   const module = await import(`../../assets/img/${name}.jpg`)
 *   <img :src="module.default" />
 *   vite静态分析时发现动态import同时使用了模板字符串(类似图片地址之类的)，
 *   会将所有以.xxx(jpg|png|gif|svg)结尾的文件都生成打包结果
 *   缺点：会多出许多js文件，且是异步，可能造成阻塞
 *  4. 同步动态导入 ⭐
 *   const obj = new URL(`../../assets/img${name.value}.jpg`, import.meta.url)
 *   单文件组件打包时会分析：
 *     <img src=""
 *     css backgroundImage
 *     import(`./assets/${name.value}.jpg`) 要求部分动态
 *     new URL(`./assets/${name.value}.jpg`
 */

const year = [1, 2, 3, 4, 5]
const name = ref('1')
const url = computed(() => {
  const obj = new URL(`../../../assets/img${name.value}.jpg`, import.meta.url)
  return obj.pathname
})

function changeImg(val: string) {
  requestAnimationFrame(() => {
    name.value = val
  })
}
</script>

<template>
  <div
    w-full h-100vh bg-cover bg-center
    transition-all ease-in
    :style="{
      backgroundImage: `url(${url})`,
    }"
  >
    <div py-10>
      <span
        v-for="moon in year" :key="moon"
        mx-4
        btn
        @click="changeImg(`${moon}`)"
      >{{ moon }}</span>
    </div>
  </div>
</template>
