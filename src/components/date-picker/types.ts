export interface IProps {
  years: number[]
  currentDate: number[]
}

export interface IData {
  current_date: number[]
  day_arr: number[]
}

export interface IInjection {
  months: number[]
  days: number[]
  years: number[]
  current_date: number[]
}

export enum PROVIDE_KEYS {
  DATA = 'date-picker-provide-key',
}

export enum DateMark {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
}

export interface ScrollContainerProps { field: string }
