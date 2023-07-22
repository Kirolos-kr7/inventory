import { CheckoutChange } from '@/utils/types'
import Filter from '@iconify/icons-mdi/filter-list'
import { Icon } from '@iconify/react/dist/offline'
import { Checkout, Donee, Item } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'

const CheckoutTable = ({
  data,
  items,
  donees,
  changes,
  update,
  openFilter
}: {
  data: Checkout[] | undefined
  items: Item[] | undefined
  donees: Donee[] | undefined
  changes: CheckoutChange[] | undefined
  update: (doneeId: number, itemId: number, amount: number) => void
  openFilter: () => void
}) => {
  const [isMobile, setIsMobile] = useState(false)

  const handleResize = () => setIsMobile(window.innerWidth < 600)

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.addEventListener('resize', handleResize)
  }, [])

  const getCell = (dId: number, iId: number) => {
    const item = data?.find(
      ({ doneeId, itemId }) => dId == doneeId && itemId == iId
    )

    const changedItem = changes?.find(
      ({ doneeId, itemId }) => dId == doneeId && itemId == iId
    )

    return (
      <input
        type="number"
        className={`bg-transparent w-8 rounded-md text-center focus-within:bg-slate-600 ${
          changedItem ? '!bg-pink-900' : ''
        }`}
        value={item?.amount || 0}
        onChange={({ target }) => {
          const val = parseInt(target.value) || 0
          update(dId, iId, val)
          target.value = String(val)
        }}
        onFocus={(e) => e.target.select()}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
      />
    )
  }

  const getTakenItems = (id: number) => {
    let total = 0

    changes?.forEach(({ itemId, diff }) => {
      if (itemId == id) total += diff
    })

    return total
  }

  const getName = useCallback(
    (name: string) =>
      isMobile ? name.split(' ').splice(0, 2).join(' ') : name,
    [isMobile]
  )

  const didTake = (dId: number) => data?.find(({ doneeId }) => doneeId == dId)

  return (
    <>
      <div
        className={`overflow-auto max-h-[calc(79lvh)] ${
          changes && changes?.length > 0 ? 'mb-[4.6rem]' : 'mb-2'
        }`}
      >
        <table className="table w-full text-right">
          <thead>
            <tr className="[&>*]:first-of-type:rounded-t-none [&>*]:last-of-type:rounded-t-none sticky top-0 shadow-sm z-[12]">
              <th className="text-base">
                <div className="flex items-center gap-1 justify-between">
                  <span>المخدوم</span>
                  <button
                    className="btn btn-square btn-xs"
                    onClick={() => openFilter()}
                  >
                    <Icon icon={Filter} width={16} />
                  </button>
                </div>
              </th>
              {items?.map(({ name, count, id }, i) => {
                const itemCount = count - getTakenItems(id)

                return (
                  <th key={i} className="text-sm px-3">
                    {name}
                    <span
                      className={`px-1 badge me-1 ${
                        itemCount < 0 ? 'badge-error' : 'text-secondary'
                      }`}
                      dir="ltr"
                    >
                      {itemCount}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {donees?.map(({ id: doneeId, name, isRegular }) => {
              const took = isRegular && didTake(doneeId)

              return (
                <tr key={doneeId}>
                  <th className="p-0">
                    <div className="relative p-4">
                      <span
                        className={`absolute start-0 w-1 h-4 rounded-e-md  inset-y-1/2 -translate-y-1/2 
                      ${took ? 'bg-green-400' : 'bg-secondary'}
                      ${isRegular ? '' : '!bg-red-400'}`}
                      />
                      {getName(name)}
                    </div>
                  </th>

                  {items?.map(({ id: itemId }, i) => (
                    <td className="px-2" key={i}>
                      {getCell(doneeId, itemId)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CheckoutTable
