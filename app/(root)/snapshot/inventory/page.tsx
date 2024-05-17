'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { Item } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { NextPage } from 'next'
import toast from 'react-hot-toast'

type src = { id: number; name: string }

const History: NextPage = () => {
  const { month, year } = useDateStore()

  const { data: items } = trpc.item.getAll.useQuery(undefined, {
    initialData: []
  })

  const { data, isLoading, refetch } = trpc.snapshot.getAll.useQuery({
    month,
    year,
    type: 'inventory'
  })

  const getValue = (row: Item[], id: number) =>
    row.find(({ id: xId }) => xId == id)?.count || '-'

  const { mutate, isLoading: isLoadingSnapshot } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/inventory-snapshot')
      const { status } = await res.json()

      if (status) {
        await refetch()
        toast.success('تم بنجاح')
        return
      }

      toast.error('محدث بالفعل')
    }
  })

  return (
    <div>
      <PageHeader
        title="لقطة المخزون"
        subtitle={<DateSelector />}
        actions={
          <Button
            className="btn-sm sm:btn-md"
            onClick={mutate}
            pending={isLoadingSnapshot}
          >
            خد لقطة
          </Button>
        }
      />

      {isLoading && <Loading />}

      {data?.length == 0 && (
        <div className="flex items-center justify-center w-full h-60 bg-base-200/75 rounded border border-base-100">
          لا توجد لقطات لهذا الشهر.
        </div>
      )}

      {!isLoading && data && data?.length > 0 && (
        <div className="overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="px-3 text-base">يوم</th>
                {items?.map(({ name }) => (
                  <th className="px-1.5 text-sm" key={name}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map(({ content, createdAt }, i) => {
                const row = content as any as Item[]

                return (
                  <tr key={createdAt.getDate() + i}>
                    <th className="px-3 text-base">{createdAt.getDate()}</th>
                    {items?.map(({ id }) => (
                      <td className="text-center table-sm px-1.5" key={id}>
                        {getValue(row, id)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default History
