import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)
dayjs.extend(localeData)
dayjs.locale('ar')

export default dayjs

export const currMonth = dayjs().format('MMM')
export const currYear = dayjs().format('YY')
export const currDateShort = `${currMonth}  ${currYear}`
export const currFinancialYear = `${currYear}-${parseInt(currYear) + 1}`

export const MONTHS = dayjs.months()
export const YEARS = [
  String(parseInt(currYear) - 1),
  currYear,
  String(parseInt(currYear) + 1)
]

export const getFinancialMonths = (year: string) => [
  { month: 'يوليو', year: parseInt(year) },
  { month: 'أغسطس', year: parseInt(year) },
  { month: 'سبتمبر', year: parseInt(year) },
  { month: 'أكتوبر', year: parseInt(year) },
  { month: 'نوفمبر', year: parseInt(year) },
  { month: 'ديسمبر', year: parseInt(year) },
  { month: 'يناير', year: parseInt(year) + 1 },
  { month: 'فبراير', year: parseInt(year) + 1 },
  { month: 'مارس', year: parseInt(year) + 1 },
  { month: 'أبريل', year: parseInt(year) + 1 },
  { month: 'مايو', year: parseInt(year) + 1 },
  { month: 'يونيو', year: parseInt(year) + 1 }
]

export const getFinancialYear = (month: string, year: string) =>
  MONTHS.slice(0, 6).includes(month) ? `${parseInt(year) - 1}` : year
