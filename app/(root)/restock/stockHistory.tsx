import Loading from '@/components/loading'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import dayjs from 'dayjs'
import { Fragment } from 'react'

const StockHistory = () => {
  const { month, year } = useDateStore()
  const { data, isLoading } = trpc.supply.getSupplyPerMonth.useQuery({
    month,
    year
  })

  if (isLoading) return <Loading offset={600} />

  if (data?.length == 0)
    return (
      <div className="text-gray-400 text-center py-8">
        <p>لا توجد عمليات سابقة</p>
      </div>
    )

  return (
    <ul className="grid grid-cols-[repeat(8,auto)] gap-x-3 items-center justify-start">
      {data?.map(({ count, id, price, src, createdAt }) => (
        <Fragment key={id}>
          <div
            className="tooltip tooltip-right w-3 h-3 flex items-center justify-start"
            data-tip={dayjs(createdAt).format('dddd D | hh:mm A')}
          >
            <span className="w-3 h-0.5 bg-gradient-to-r from-secondary to-primary from-60%" />
          </div>
          <span className="text-green-500">{count}</span>
          <span>وحدة</span>
          <span className="text-secondary">{src.name}</span>
          <span>بسعر</span>
          <span className="text-green-500">{price}</span>
          <span>بإجمالي</span>
          <span className="text-red-400">{count * price}</span>
        </Fragment>
      ))}
    </ul>
  )
}

export default StockHistory
