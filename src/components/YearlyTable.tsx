import {
  currFinancialYear,
  currMonth,
  currYear,
  getFinancialMonths,
} from "@/utils/dayjs"
import { type FinanceWithSrc } from "@/utils/types"
import { type FinanceList } from "@prisma/client"

const YearlyTable = ({
  data,
  financeList,
  year,
}: {
  data: FinanceWithSrc[] | undefined
  financeList: FinanceList[] | undefined
  year: string
}) => {
  const getCellData = (label: string, m: string, yr: string) => {
    const value = data?.find(
      ({ src: { name }, month, year: itemYear }) =>
        name == label && month == m && itemYear == yr
    )?.price

    return typeof value == "number" && value > 0 ? String(value) : "-"
  }

  const getCellTotal = (label: string) => {
    let total = 0

    data?.forEach(({ src: { name }, price }) => {
      if (name == label) total += price
    })

    return typeof total == "number" ? total : "-"
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-right">
        <thead>
          <tr>
            <th className="px-1.5 text-base w-1/5">الشهر</th>
            {financeList?.map(({ name: label }, i) => (
              <th key={i} className="px-1.5 text-sm">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getFinancialMonths(year).map(({ month, year: yr }) => (
            <tr
              key={month}
              className={`table-compact ${
                month == currMonth && `${yr}-${yr + 1}` == currFinancialYear
                  ? "active"
                  : ""
              }`}
            >
              <th>
                <div className="flex items-end gap-1">
                  {month}
                  <span className="text-gray-400 font-normal text-xs -mb-px">
                    {yr}
                  </span>
                </div>
              </th>
              {financeList?.map(({ name: label }, i) => (
                <td key={i}>{getCellData(label, month, String(yr))}</td>
              ))}
            </tr>
          ))}

          <tr className="bg-base-300 border-t-2 border-primary [&>*]:bg-inherit">
            <th>الاجمالي</th>
            {financeList?.map(({ name: label }, i) => (
              <td key={i} className="px-1.5 text-sm">
                {getCellTotal(label)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default YearlyTable
