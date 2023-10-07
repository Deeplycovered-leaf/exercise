export function create_month_arr(): number[] {
  const result = []
  let i = 12

  while (i) {
    result.push(i)
    i--
  }

  return result.reverse()
}

export function create_day_arr(date: number[]): number[] {
  let count = get_day_count(date)
  const res = []

  while (count) {
    res.push(count)
    count--
  }

  return res.reverse()
}

function get_day_count([year, month]: number[]): number {
  return new Date(year, month, 0).getDate()
}
