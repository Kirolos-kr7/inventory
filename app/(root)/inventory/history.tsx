'use client'

import Loading from '@/components/loading'
import dayjs from '@/utils/dayjs'
import { trpc } from '@/utils/trpc'
import { Item } from '@prisma/client'

const History = ({ item }: { item: Item | null }) => {
  if (!item)
    return (
      <div className="text-gray-400 text-center py-8">
        <p>لا توجد عمليات سابقة</p>
      </div>
    )

  const { data, isLoading } = trpc.transaction.getAll.useQuery(item?.id, {
    cacheTime: 0
  })

  if (isLoading) return <Loading offset={600} />

  if (data?.length == 0)
    return (
      <div className="text-gray-400 text-center py-8">
        <p>لا توجد عمليات سابقة</p>
      </div>
    )

  return (
    <ul>
      {data?.map(({ message, id, createdAt }) => {
        const cat = dayjs(createdAt)

        return (
          <li key={id} className="flex items-center gap-3">
            <span className="w-3 h-0.5 bg-gradient-to-r from-secondary to-primary from-60% " />
            <p className="flex gap-2">
              <span
                className="tooltip tooltip-right"
                data-tip={cat.format('dddd D MMM YYYY hh:mm A')}
              >
                [{cat.format('hh:mm A')}]
              </span>
              {message}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

export default History
