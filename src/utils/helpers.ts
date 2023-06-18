import { currYear } from "./dayjs"
import { trpc } from "./trpc"

export const yearList = (financial: boolean = false) => {
  const { data } = trpc.meta.get.useQuery("initYear")
  let initYear = parseInt(data ? data : currYear)
  const years: string[] = []

  for (let i = 0; i < parseInt(currYear) - initYear + 2; i++) {
    const num = initYear + i
    years.push(financial ? `${num}-${num + 1}` : `${num}`)
  }

  return years
}
