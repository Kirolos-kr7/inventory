import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import localeData from "dayjs/plugin/localeData"
import "dayjs/locale/ar"
dayjs.extend(localizedFormat)
dayjs.extend(localeData)
dayjs.locale("ar")

export default dayjs

export const currMonth = dayjs().format("MMM")
export const currYear = dayjs().format("YY")
export const currDateShort = `${currMonth}  ${currYear}`

export const MONTHS = dayjs.months()
export const FINANCIAL_MONTHS = [
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
]
export const YEARS = [
  String(parseInt(currYear) - 1),
  currYear,
  String(parseInt(currYear) + 1),
]
