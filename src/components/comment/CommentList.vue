<script lang="ts" setup>
import type { IComment } from '~/shared/comment'

const props = defineProps<{
  data: IComment[]
}>()
const emits = defineEmits(['addReply'])

function setReplyFlag(item: IComment) {
  item.isReply = !item.isReply
}

function addReply(item: IComment) {
  const replyText = item.replyText
  emits('addReply', item, replyText)
  item.isReply = false
  item.replyText = ''
}
</script>

<template>
  <li v-for="item of props.data" :key="item.id">
    <p>{{ item.username }}</p>
    <p>{{ item.comment }}</p>
    <a href="javascript:;" @click="setReplyFlag(item)">回复</a>
    <div v-if="item.isReply">
      <p>
        <textarea v-model="item.replyText" />
      </p>
      <button btn @click="addReply(item)">
        提交回复
      </button>
    </div>
    <div v-if="item.children">
      <ul>
        <CommentList :data="item.children" @add-reply="addReply" />
      </ul>
    </div>
  </li>
</template>

<style scoped>

</style>
