import { FINANCIAL_MONTHS, currMonth, currYear } from "@/utils/dayjs"
import { type SupplyWithSrc } from "@/utils/types"
import { Fragment } from "react"

const SupplyTable = ({
  data,
  supplyList,
  year,
  showDetails,
}: {
  data: SupplyWithSrc[] | undefined
  supplyList: { id: number; name: string }[] | undefined
  year: string
  showDetails: boolean
}) => {
  const getCellData = (label: string, m: string) => {
    const items = data?.filter(
      ({ src: { name }, month }) => name == label && month == m
    )

    if (items && items.length > 0) {
      return (
        <div className="flex gap-1 items-center">
          {items?.map(({ price, count, id }, i) => (
            <Fragment key={id}>
              {i != 0 && <span>+</span>}
              <div className="py-1 w-fit">
                <div className="flex flex-col text-center" dir="ltr">
                  {showDetails && (
                    <span className="border-b border-gray-400">
                      {price + " × "}
                      <span className="text-secondary">{count}</span>
                    </span>
                  )}
                  <span>{price * count}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )
    } else return "-"
  }

  const getItemTotal = (label: string) => {
    let total = 0

    data?.forEach(({ src: { name }, price, count }) => {
      if (name == label) total += price * count
    })

    return typeof total == "number" ? total : "-"
  }

  const getMonthlyTotal = (label: string) => {
    let total = 0

    data?.forEach(({ month, price, count }) => {
      if (month == label) total += price * count
    })

    return total || "-"
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-right">
        <thead>
          <tr>
            <th className="px-1.5 text-base w-1/3">الشهر</th>
            {supplyList?.map(({ name: label }, i) => (
              <th key={i} className="px-1.5 text-sm">
                {label}
              </th>
            ))}
            <th className="px-1.5 text-base w-1/3">اجمالي الشهر</th>
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
              {supplyList?.map(({ name: label }, i) => (
                <td key={i} className="p-0">
                  {getCellData(label, m)}
                </td>
              ))}
              <td>{getMonthlyTotal(m)}</td>
            </tr>
          ))}

          <tr className="bg-base-300 border-t-2 border-primary">
            <th className="bg-transparent">اجمالي العنصر</th>
            {supplyList?.map(({ name: label }, i) => (
              <td key={i} className="px-1.5 bg-transparent text-sm">
                {getItemTotal(label)}
              </td>
            ))}
            <td className="px-1.5 bg-transparent text-sm">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default SupplyTable
