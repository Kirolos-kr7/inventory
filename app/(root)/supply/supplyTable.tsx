import { currFinancialYear, currMonth, getFinancialMonths } from '@/utils/dayjs'
import { type SupplyWithSrc } from '@/utils/types'
import { Fragment } from 'react'

const SupplyTable = ({
  data,
  supplyList,
  year,
  showDetails
}: {
  data: SupplyWithSrc[] | undefined
  supplyList: { id: number; name: string }[] | undefined
  year: string
  showDetails: boolean
}) => {
  const getCellData = (label: string, m: string, yr: string) => {
    const items = data?.filter(
      ({ src: { name }, month, year: itemYear }) =>
        name == label && month == m && itemYear == yr
    )

    if (items && items.length > 0) {
      const total = items
        .map(({ price, count }) => price * count)
        .reduce((a, c) => (a += c))

      return (
        <>
          {showDetails ? (
            <div className="flex gap-1 items-center border border-dashed px-1 w-min">
              {items?.map(({ price, count, id }, i) => (
                <Fragment key={id}>
                  {i != 0 && <span> + </span>}
                  <div className="py-1 w-fit">
                    <div className="flex flex-col text-center" dir="ltr">
                      <span className="border-b border-gray-400">
                        {price + ' × '}
                        <span className="text-secondary">{count}</span>
                      </span>
                      <span className="hidden"> = </span>
                      <span>{price * count}</span>
                    </div>
                  </div>
                </Fragment>
              ))}
              <span className="hidden"> ({total}) </span>
            </div>
          ) : (
            <div>{total}</div>
          )}
        </>
      )
    } else return '-'
  }

  const getItemTotal = (label: string) => {
    let total = 0

    data?.forEach(({ src: { name }, price, count }) => {
      if (name == label) total += price * count
    })

    return typeof total == 'number' ? total : '-'
  }

  const getMonthlyTotal = (label: string, yr: string) => {
    let total = 0

    data?.forEach(({ month, price, count, year: itemYear }) => {
      if (month == label && itemYear == yr) total += price * count
    })

    return total || '-'
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-right">
        <thead>
          <tr>
            <th className="px-1.5 text-base w-1/5">الشهر</th>
            {supplyList?.map(({ name: label }, i) => (
              <th key={i} className="px-1.5 text-sm">
                {label}
              </th>
            ))}
            <th className="px-1.5 text-base">اجمالي الشهر</th>
          </tr>
        </thead>
        <tbody>
          {getFinancialMonths(year).map(({ month, year: yr }) => (
            <tr
              key={month}
              className={`table-compact ${
                month == currMonth && `${yr}-${yr + 1}` == currFinancialYear
                  ? 'active'
                  : ''
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
              {supplyList?.map(({ name: label }, i) => (
                <td key={i} className="px-1">
                  {getCellData(label, month, String(yr))}
                </td>
              ))}
              <td>{getMonthlyTotal(month, String(yr))}</td>
            </tr>
          ))}

          <tr className="bg-base-300 border-t-2 border-primary [&>*]:bg-inherit">
            <th className="px-1.5 text-base w-1/5">اجمالي العنصر</th>
            {supplyList?.map(({ name: label }, i) => (
              <td key={i} className="px-1.5 text-sm">
                {getItemTotal(label)}
              </td>
            ))}
            <td className="px-1.5 text-sm">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default SupplyTable
