<script lang="ts" setup>
import type { IComment } from '~/shared/comment'
import { commentList } from '~/shared'
import { useUserStore } from '~/store'

const state = reactive({ commentText: '', commentTree: commentList })
const userStore = useUserStore()

function addComment() {
  if (!state.commentText) {
    // eslint-disable-next-line no-alert
    alert('内容不能为空')
    return
  }
  const commentInfo: IComment = {
    id: new Date().getTime(),
    pid: 0,
    uid: userStore.userInfo.id,
    username: userStore.userInfo.username,
    comment: state.commentText,
  }

  commentList.value.unshift(commentInfo)
  state.commentText = ''
}

function addReply(item: IComment, replyText: string) {
  const commentInfo: IComment = {
    id: new Date().getTime(),
    pid: item.id,
    uid: userStore.userInfo.id,
    username: userStore.userInfo.username,
    comment: replyText,
  }

  if (!item.children)
    item.children = []

  item.children?.push(commentInfo)
}
</script>

<template>
  <form @submit.prevent="addComment">
    <p>
      <textarea v-model.trim="state.commentText" @keyup.enter="addComment" />
    </p>
    <p>
      <button btn type="submit">
        提交评论
      </button>
    </p>
  </form>
  <ul>
    <CommentList :data="state.commentTree" @add-reply="addReply" />
  </ul>
</template>

<style scoped>

</style>
