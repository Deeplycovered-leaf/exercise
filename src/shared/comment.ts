import { useStorage } from '@vueuse/core'

interface IComment {
  id: number
  pid: number
  uid: number
  username: string
  comment: string
  isReply?: boolean
  replyText?: string
  children?: IComment[]
}
const commentList = useStorage<IComment[]>('one', [])

export { commentList, IComment }
