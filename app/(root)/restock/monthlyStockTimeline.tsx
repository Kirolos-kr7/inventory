'use client'

import { SupplyWithSrc } from '@/utils/types'
import asterisk from '@iconify/icons-mdi/asterisk'
import calendar from '@iconify/icons-mdi/calendar'
import equal from '@iconify/icons-mdi/equal'
import x from '@iconify/icons-mdi/remove'
import { Icon } from '@iconify/react/dist/offline'
import dayjs from 'dayjs'
import { Fragment, useMemo } from 'react'

interface Purchase {
  count: number
  price: number
  id: number
  dt: string
  name: string
}

const MonthlyStockTimeline = ({
  data
}: {
  data: SupplyWithSrc[] | undefined
}) => {
  console.log(data?.map(({ createdAt }) => ({ createdAt })))

  const dates = useMemo(() => {
    const purchases = data?.map(
      ({ count, price, id, createdAt, src: { name } }) => {
        const dt = dayjs(createdAt).format('LL')
        return { count, price, id, dt, name }
      }
    )

    const tmp = purchases?.reduce((group, purchase) => {
      const { dt } = purchase
      // @ts-ignore
      group[dt] = group[dt] ?? []
      // @ts-ignore
      group[dt].push(purchase)
      return group
    }, {})

    return Object.entries(tmp as { [dt: string]: Purchase[] })
  }, [data])

  return (
    <>
      <ul className="timeline timeline-snap-icon timeline-compact timeline-vertical">
        {dates?.map(([dt, data], i) => (
          <li key={dt}>
            <div className="timeline-start">{dt}</div>
            <div className="timeline-middle p-1 bg-gray-600 rounded-full">
              <Icon icon={calendar} />
            </div>
            <div className="timeline-end timeline-box grid grid-cols-[repeat(6,auto)] items-center gap-3 text-center">
              {data.map(({ id, name, price, count }) => (
                <Fragment key={id}>
                  <span>{count}</span>
                  <span className="text-primary w-11">{name}</span>
                  <Icon icon={x} />
                  <span>{price}</span>
                  <Icon icon={equal} />
                  <span className="text-secondary">{price * count}</span>
                </Fragment>
              ))}
            </div>
            {i != dates.length - 1 && <hr />}
            {i != 0 && <hr />}
          </li>
        ))}
        <li>
          <hr />
          <div className="timeline-start">الاجمالي </div>
          <div className="timeline-middle p-1 bg-gray-600 rounded-full">
            <Icon icon={asterisk} />
          </div>
          <div className="timeline-end timeline-box flex items-center gap-5">
            <span className="text-secondary">
              {data
                ?.map(({ price, count }) => price * count)
                .reduce((p, c) => p + c)}
            </span>
          </div>
        </li>
      </ul>
    </>
  )
}

export default MonthlyStockTimeline
