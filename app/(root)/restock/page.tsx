'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import Table from '@iconify/icons-mdi/table'
import Timeline from '@iconify/icons-mdi/timeline'
import { Icon } from '@iconify/react/dist/offline'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import MonthlyStockTable from './monthlyStockTable'
import MonthlyStockTimeline from './monthlyStockTimeline'

type src = { id: number; name: string }

const InventoryAdd: NextPage = () => {
  const { month, year } = useDateStore()
  const [view, setView] = useState<'table' | 'timeline'>('table')
  const { data } = trpc.item.getAll.useQuery()
  const {
    data: prev,
    refetch,
    isLoading,
    isRefetching
  } = trpc.supply.getSupplyPerMonth.useQuery({
    month,
    year,
    view
  })

  const [srcList, setSrcList] = useState<src[]>([])
  const [dialogOpened, setDialogOpened] = useState(false)

  useEffect(() => {
    if (data && data?.length > 0)
      data.forEach((item) => {
        setSrcList((v) => {
          if (v.find((x) => x.id == item.id)) return v

          return [...v, { id: item.id, name: item.name }]
        })
      })
  }, [data])

  return (
    <div>
      <PageHeader
        title="اضافة للمخزون"
        actions={
          <div className="flex items-center gap-2">
            {view == 'timeline' && (
              <Button
                className="btn-sm sm:btn-md"
                onClick={() => setView('table')}
              >
                <Icon icon={Table} width={26} />
              </Button>
            )}
            {view == 'table' && (
              <>
                <Button
                  className="btn-sm sm:btn-md"
                  onClick={() => setView('timeline')}
                >
                  <Icon icon={Timeline} width={26} />
                </Button>
                <Button
                  className="btn-sm sm:btn-md"
                  onClick={() => setDialogOpened(true)}
                >
                  اضافة
                </Button>
              </>
            )}
          </div>
        }
        subtitle={<DateSelector />}
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <>
          {prev?.length == 0 ? (
            <div className="flex items-center justify-center w-full h-60">
              لا توجد عمليات شراء لهذا الشهر.
            </div>
          ) : (
            <>
              {view == 'table' ? (
                <MonthlyStockTable
                  data={prev}
                  refetch={refetch as any}
                  pending={isRefetching}
                  dialogOpened={dialogOpened}
                  setDialogOpened={setDialogOpened}
                />
              ) : (
                <MonthlyStockTimeline data={prev} />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default InventoryAdd
