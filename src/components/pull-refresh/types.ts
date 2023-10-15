export interface IProps {
  willPullTip: string
  pullingTip: string
  loadingTip: string
  tipColor: string
  tipSize: number
  bgColor: string
  loadingDuration: number
}

export interface IState {
  refreshTip: string
  refreshHeight: number
  refreshShow: boolean
  needTransition: boolean
}

export interface TouchingPosition {
  start: number
  end: number
}

export enum DefaultTips {
  WILL_PULL_TIP = '下拉刷新...',
  PULLING_TIP = '释放更新...',
  LOADING_TIP = '加载中...',
}

export enum DefaultConfigs {
  TIP_COLOR = '#ccc',
  TIP_SIZE = 15,
  BG_COLOR = '#fff',
  LOADING_DURATION = 1000,
  MIN_REFRESHING_HEIGHT = 60,
  TRANSITION_DURATION = 0.3,
}
