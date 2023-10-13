'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import MonthlyStockTable from './monthlyStockTable'

type src = { id: number; name: string }
interface RestockSupply {
  src: src
  count: number
  pricePerUnit: number
  totalPrice: number
}

const InventoryAdd: NextPage = () => {
  const { month, year } = useDateStore()
  const { data } = trpc.item.getAll.useQuery()
  const {
    data: prev,
    refetch,
    isLoading,
    isRefetching
  } = trpc.supply.getSupplyPerMonth.useQuery({
    month,
    year
  })
  const supplyMutation = trpc.supply.addToSupply.useMutation()

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

  const [supply, setSupply] = useState<RestockSupply[]>([])

  const add = () => {
    if (!srcList) return

    setSupply((v) => [
      ...v,
      {
        src: srcList[0],
        count: 0,
        pricePerUnit: 0,
        totalPrice: 0
      }
    ])
  }

  const remove = (i: number) => {
    setSupply((v) => v.filter((_, index) => index != i))
  }

  const handleChange = (
    field: 'src' | 'count' | 'pricePerUnit' | 'totalPrice',
    value: string,
    index: number
  ) => {
    setSupply((v) => {
      v = v.map((entry, i) => {
        if (index == i) {
          const x = srcList?.find(({ name }) => value == name)
          if (x) entry.src = x

          if (
            field == 'count' ||
            field == 'pricePerUnit' ||
            field == 'totalPrice'
          )
            entry[field] = parseFloat(value)

          if (field == 'totalPrice')
            entry['pricePerUnit'] = entry['totalPrice'] / entry['count']
          if (field == 'pricePerUnit')
            entry['totalPrice'] = entry['pricePerUnit'] * entry['count']
        }

        return entry
      })

      return v
    })
  }

  return (
    <div>
      <PageHeader
        title="اضافة للمخزون"
        actions={
          <>
            <Button onClick={() => setDialogOpened(true)}>اضافة</Button>
          </>
        }
        subtitle={<DateSelector />}
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <>
          <MonthlyStockTable
            data={prev}
            refetch={refetch as any}
            pending={isRefetching}
            dialogOpened={dialogOpened}
            setDialogOpened={setDialogOpened}
          />
        </>
      )}
    </div>
  )
}

export default InventoryAdd
