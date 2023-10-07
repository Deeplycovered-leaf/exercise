import * as userApi from './user'

export enum API_URL {
  // auth
  authLogin = '/auth/login',
  // auth
}

export const api = {
  ...userApi,
}
