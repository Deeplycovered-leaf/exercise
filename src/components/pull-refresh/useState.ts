import type { IState } from './types'
import { DefaultTips } from './types'

const state = reactive<IState>({
  refreshTip: DefaultTips.WILL_PULL_TIP,
  refreshHeight: 0,
  refreshShow: false,
  needTransition: false,
})

export function useState() {
  return state
}
