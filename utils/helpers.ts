import { currYear } from './dayjs'
import { trpc } from './trpc'

export const yearList = (financial: boolean = false) => {
  const { data } = trpc.meta.get.useQuery('initYear')
  let initYear = parseInt(data ? data : currYear)
  const years: { name: string; value: string }[] = []

  for (let i = 0; i < parseInt(currYear) - initYear + 2; i++) {
    const num = initYear + i - 1
    years.push(
      financial
        ? { name: `${num + 1}-${num}`, value: `${num + 1}` }
        : { name: `${num}`, value: `${num}` }
    )
  }

  return years
}

export const useResetDateStore = () => {
  const { month, setMonth, year, setYear } = useDateStore()

  useEffect(() => {
    const oldMonth = month,
      oldYear = year

    setMonth(currMonth)
    setYear(currYear)

    return () => {
      setMonth(oldMonth)
      setYear(oldYear)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMonth, setYear])
}
