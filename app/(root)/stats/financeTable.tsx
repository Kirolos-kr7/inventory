import { currFinancialYear, currMonth, getFinancialMonths } from '@/utils/dayjs'
import { FinanceChange, type FinanceWithSrc } from '@/utils/types'
import { type FinanceList } from '@prisma/client'

const YearlyTable = ({
  data,
  changes,
  financeList,
  year,
  update
}: {
  data: FinanceWithSrc[] | undefined
  changes: FinanceChange[] | undefined
  financeList: FinanceList[] | undefined
  year: string
  update: (sId: number, month: string, val: number) => void
}) => {
  const getCell = (sId: number, month: string) => {
    const item = data?.find(
      ({ srcId, month: mth }) => sId == srcId && month == mth
    )
    const changedItem = changes?.find(
      ({ srcId, month: mth }) => srcId == sId && month == mth
    )

    return (
      <input
        type="number"
        className={`bg-transparent w-10 rounded-md text-center focus-within:bg-slate-600 ${
          changedItem ? '!bg-pink-900' : ''
        }`}
        value={item?.price || 0}
        onChange={({ target }) => {
          const val = parseInt(target.value) || 0
          update(sId, month, val)
          target.value = String(val)
        }}
        onFocus={(e) => e.target.select()}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
      />
    )
  }

  const getCellTotal = (label: string) => {
    let total = 0

    data?.forEach(({ src: { name }, price }) => {
      if (name == label) total += price
    })

    return typeof total == 'number' ? total : '-'
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
              className={`table-sm ${
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
              {financeList?.map(({ id }, i) => (
                <td key={i}>{getCell(id, month)}</td>
              ))}
            </tr>
          ))}

          <tr className="bg-base-300 border-t-2 border-primary [&>*]:bg-inherit">
            <th className="px-1.5 text-base w-1/5">الاجمالي</th>
            {financeList?.map(({ name: label }, i) => (
              <td key={i} className="px-5 text-sm">
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
