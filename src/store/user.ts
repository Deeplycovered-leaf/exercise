import { defineStore } from 'pinia'

export interface IUserInfo {
  id: number
  username: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = reactive({ id: 1, username: 'zs' })

  function setUserInfo(info: IUserInfo) {
    Object.assign(userInfo, info)
  }

  return { userInfo, setUserInfo }
})
