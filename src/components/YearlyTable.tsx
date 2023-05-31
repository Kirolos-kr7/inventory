import { FINANCIAL_MONTHS, currMonth, currYear } from "@/utils/dayjs"
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
  const getCellData = (label: string, m: string) => {
    const value = data?.find(
      ({ src: { name }, month }) => name == label && month == m
    )?.price

    return typeof value == "number" ? String(value) : "-"
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
            <th className="px-1.5 text-base w-1/3">الشهر</th>
            {financeList?.map(({ name: label }, i) => (
              <th key={i} className="px-1.5 text-sm">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FINANCIAL_MONTHS.map((m) => (
            <tr
              key={m}
              className={`table-compact ${
                m == currMonth && year == currYear ? "active" : ""
              }`}
            >
              <th>{m}</th>
              {financeList?.map(({ name: label }, i) => (
                <td key={i}>{getCellData(label, m)}</td>
              ))}
            </tr>
          ))}

          <tr className="bg-base-300 border-t-2 border-primary">
            <th className="bg-transparent">الاجمالي</th>
            {financeList?.map(({ name: label }, i) => (
              <td key={i} className="px-1.5 bg-transparent text-sm">
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
