<script lang="ts" setup>
import { useUserStore } from '~/store'

const userStore = useUserStore()
</script>

<template>
  <div>
    <h1>{{ userStore.userInfo.username }}</h1>

    <button
      :class="{ 'bg-black text-white': userStore.userInfo.id === 1 }"
      btn
      @click="userStore.setUserInfo({ id: 1, username: 'zs' })"
    >
      张三
    </button>
    <button
      :class="{ 'bg-black text-white': userStore.userInfo.id === 2 }"
      btn
      @click="userStore.setUserInfo({ id: 2, username: 'ls' })"
    >
      李四
    </button>
    <button
      :class="{ 'bg-black text-white': userStore.userInfo.id === 3 }"
      btn
      @click="userStore.setUserInfo({ id: 3, username: 'ww' })"
    >
      王五
    </button>

    <CommentOne />
  </div>
</template>

<style scoped>

</style>
