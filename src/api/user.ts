import { API_URL } from '.'
import request from '~/utils/http'

export interface Login {
  tel: string
  pwd: string
}
export function userLogin(params: Login) {
  return request({
    url: API_URL.authLogin,
    method: 'POST',
    data: params,
  })
}
