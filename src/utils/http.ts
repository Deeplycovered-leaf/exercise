import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAxios } from '@vueuse/integrations/useAxios'
import { ElMessage } from 'element-plus'

const networkErrMap: { [index: number]: string } = {
  400: '错误的请求',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求错误，未找到该资源',
  405: '请求方法未允许',
  408: '请求超时',
  500: '服务器端出错',
  501: '网络未实现',
  502: '网络错误',
  503: '服务不可用',
  504: '网络超时',
  505: 'http版本不支持该请求',
}
const authErrMap: { [index: number]: string } = {
  10031: '登录失效，需要重新登录',
  10032: '您太久没登录，请重新登录~',
  10033: '账户未绑定角色，请联系管理员绑定角色',
  10034: '该用户未注册，请联系管理员注册用户',
  10035: 'code 无法获取对应第三方平台用户',
  10036: '该账户未关联员工，请联系管理员做关联',
  10037: '账号已无效',
  10038: '账号未找到',
}
const instance: AxiosInstance = axios.create({
  // 默认地址请求地址，可在 .env 开头文件中修改
  baseURL: '/api',
  timeout: 5000,
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做一些事情

    // if (store.getters.token) {
    //   // 让每个请求都带有令牌
    //   // ['X-Token']是自定义标题键
    //   // 请根据实际情况进行修改
    //   config.headers['X-Token'] = getToken()
    // }
    return config
  },
  (error: AxiosError) => {
    // 请求错误做一些操作
    // eslint-disable-next-line no-console
    console.log(error) // 用于调试
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  /**
   * 如果要获取http信息（例如标题或状态）
   * Please return  response => response
   */

  /**
   * 通过自定义代码确定请求状态
   * 这只是一个例子
   * 您还可以通过HTTP状态代码来判断状态
   */
  (response: AxiosResponse) => {
    const { data } = response

    // 如果自定义状态码不是20000，则将其判断为错误。
    if (data.code !== 20000) {
      ElMessage({
        message: data.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      })
      // router.replace({
      //   path: '/login',
      // })
      return Promise.reject(data)
    }
    // 50008: 非法 token; 50012: 其他客户登录; 50014: Token 过期;
    if (authErrMap[data.code]) {
      // 重新登录
      // MessageBox.confirm(
      //  '您已注销，可以取消以保留在该页面上，或者再次登录', '确认登出',
      //   {
      //     confirmButtonText: 'Re-Login',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning',
      //   }
      // ).then(() => {
      //   store.dispatch('user/resetToken').then(() => {
      //     location.reload()
      //   })
      // })
      ElMessage.error(data.msg)
      // setToken('')
      return Promise.reject(new Error(data.message || 'Error'))
    }

    return data
  },
  (error: AxiosError) => {
    // eslint-disable-next-line no-console
    console.log(`err${error}`) // for debug
    let message = error.message
    if (error.status)
      message = networkErrMap[error.status]
    ElMessage.error({
      message,
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  },
)

export default <T>(config: AxiosRequestConfig) => useAxios<T>(config, instance)
