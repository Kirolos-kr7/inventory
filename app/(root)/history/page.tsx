'use client'

import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import calendar from '@iconify/icons-mdi/calendar'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import { NextPage } from 'next'

type src = { id: number; name: string }

const History: NextPage = () => {
  const { month, year } = useDateStore()
  const { data, isLoading } = trpc.snapshot.getAll.useQuery({
    month,
    year,
    type: 'inventory'
  })

  return (
    <div>
      <PageHeader title="تاريخ العمليات" subtitle={<DateSelector />} />

      {isLoading && <Loading />}

      {!isLoading && (
        <ul className="timeline timeline-snap-icon timeline-compact timeline-vertical">
          {data?.map(({ content, createdAt }) => {
            const row = content as Array<{
              id: number
              name: string
              count: number
            }>

            return (
              <li key={createdAt.toString()}>
                <div className="timeline-start">
                  {dayjs(createdAt).format('LL')}
                </div>
                <div className="timeline-middle p-1 bg-gray-600 rounded-full">
                  <Icon icon={calendar} />
                </div>
                <div className="timeline-end w-full overflow-scroll">
                  <table className="table  w-full">
                    <thead>
                      {row.map(({ name }) => (
                        <th>{name}</th>
                      ))}
                    </thead>
                    <tbody>
                      {row.map(({ count }) => (
                        <td className="text-center">{count}</td>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default History
