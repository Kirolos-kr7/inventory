'use client'

import Button from '@/components/button'
import Dialog from '@/components/dialog'
import { floatW2 } from '@/utils/helpers'
import { SupplyWithSrc } from '@/utils/types'
import ChevronDown from '@iconify/icons-mdi/chevron-down'
import ChevronUp from '@iconify/icons-mdi/chevron-up'
import Delete from '@iconify/icons-mdi/delete'
import Edit from '@iconify/icons-mdi/edit'
import { Icon } from '@iconify/react/dist/offline'
import { Dispatch, Fragment, SetStateAction, useMemo, useState } from 'react'
import DeleteStockEntry from './deleteStockEntry'
import EditStockEntry from './editStockEntry'

const MonthlyStockTable = ({
  data,
  refetch,
  pending,
  dialogOpened,
  setDialogOpened
}: {
  data: SupplyWithSrc[] | undefined
  refetch: () => Promise<void>
  pending: boolean
  dialogOpened: boolean
  setDialogOpened: Dispatch<SetStateAction<boolean>>
}) => {
  const [activeSrc, setActiveSrc] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedStock, setSelectedStock] = useState<number | null>(null)

  const actions = useMemo(() => {
    let rows: {
      key: number
      items: SupplyWithSrc[]
      count?: number
      avgPrice?: number
      total?: number
    }[] = []

    data?.forEach((stock) => {
      const rowAvaiable =
        rows.length > 0 && rows.find(({ key }) => key == stock.srcId)

      if (rowAvaiable) {
        rows = rows.map((row) => {
          if (row.key == stock.srcId) row.items = [...row.items, stock]

          return row
        })
      } else {
        rows = [...rows, { key: stock.srcId, items: [stock] }]
      }
    })

    rows = rows.map((row) => {
      if (row.items.length == 1) return row

      row.count = row.items.map(({ count }) => count).reduce((p, c) => p + c)

      row.total = row.items
        .map(({ count, price }) => count * price)
        .reduce((p, c) => p + c)

      row.avgPrice =
        row.items
          .map(({ price, count }) => price * count)
          .reduce((p, c) => p + c) /
        row.items.map(({ count }) => count).reduce((p, c) => p + c)

      return row
    })

    return rows
  }, [data])

  return (
    <>
      <div className="overflow-x-auto rounded-lg">
        <table className="table w-full text-right">
          <thead>
            <tr>
              <th className="px-1.5 text-base w-1/5">العنصر</th>
              <th className="px-1.5 text-sm">العدد</th>
              <th className="px-1.5 text-sm">سعر الوحدة</th>
              <th className="px-1.5 text-sm">الاجمالي</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {actions?.map(
              ({ key, items, count: itemsCount, total, avgPrice }) => (
                <Fragment key={key}>
                  {items.map(({ count, id, price, src }, i) => (
                    <Fragment key={id}>
                      {items.length > 1 && i == 0 && (
                        <tr
                          className={`table-sm ${
                            activeSrc && '[&>td]:border-b-0'
                          } ${
                            activeSrc && src.id != activeSrc
                              ? 'text-gray-600'
                              : ''
                          }`}
                        >
                          <td className="text-base font-semibold">
                            {items[0].src.name}
                          </td>
                          <td>{itemsCount}</td>
                          <td>
                            {avgPrice && floatW2(avgPrice)}
                            <span
                              className={`badge badge-sm badge-secondary mx-1 ${
                                activeSrc && src.id != activeSrc
                                  ? 'opacity-0'
                                  : ''
                              }`}
                            >
                              متوسط
                            </span>
                          </td>
                          <td>{total}</td>
                          <td className="w-4">
                            <div className="flex justify-end">
                              <Button
                                className="btn h-auto min-h-min rounded-full p-1"
                                onClick={() =>
                                  setActiveSrc((v) => (!v ? src.id : null))
                                }
                              >
                                <Icon
                                  icon={
                                    activeSrc == src.id
                                      ? ChevronUp
                                      : ChevronDown
                                  }
                                  width={16}
                                />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {(items.length == 1 || src.id == activeSrc) && (
                        <tr
                          className={`table-sm ${
                            items.length > 1 && i == 0
                              ? '[&>td]:border-b-0'
                              : ''
                          } ${
                            activeSrc && src.id != activeSrc
                              ? 'text-gray-600'
                              : ''
                          }`}
                        >
                          <td className="text-base font-semibold">
                            {items.length == 1 && src.name}
                          </td>
                          <td>{count}</td>
                          <td>{price}</td>
                          <td>{count * price}</td>
                          <td>
                            <div className="flex gap-1">
                              <Button
                                className={`btn btn-ghost h-auto min-h-min rounded-full p-1 ${
                                  !activeSrc || src.id == activeSrc
                                    ? 'text-secondary'
                                    : 'text-secondary/50'
                                }`}
                                onClick={() => {
                                  setDialogOpened(true)
                                  setSelectedStock(id)
                                }}
                              >
                                <Icon icon={Edit} width={16} />
                              </Button>
                              <Button
                                className={`btn btn-ghost h-auto min-h-min rounded-full p-1 ${
                                  !activeSrc || src.id == activeSrc
                                    ? 'text-primary'
                                    : 'text-primary/50'
                                }`}
                                onClick={() => {
                                  setDeleteDialog(true)
                                  setSelectedStock(id)
                                }}
                              >
                                <Icon icon={Delete} width={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </Fragment>
              )
            )}

            <tr className="bg-base-300 border-t-2 border-primary [&>*]:bg-inherit">
              <th className="px-1.5 text-base w-1/5">اجمالي الشهر</th>
              <td />
              <td />
              <td className="px-1.5 text-sm">
                {data &&
                  data?.length > 0 &&
                  data
                    .map(({ count, price }) => count * price)
                    .reduce((p, c) => p + c)}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogOpened}
        close={() => {
          setDialogOpened(false)
          setSelectedStock(null)
        }}
        header={selectedStock ? 'تعديل الادخال' : 'ادخال جديد'}
        body={
          <EditStockEntry
            supply={data?.find(({ id }) => selectedStock == id)}
            done={async () => {
              await refetch()
              setDialogOpened(false)
              setSelectedStock(null)
            }}
            pending={pending}
          />
        }
      />

      <Dialog
        open={deleteDialog && typeof selectedStock == 'number'}
        close={() => setDeleteDialog(false)}
        header={'مسح الادخال'}
        body={
          <DeleteStockEntry
            supplyId={selectedStock}
            done={async () => {
              await refetch()
              setDeleteDialog(false)
              setSelectedStock(null)
              setActiveSrc(null)
            }}
            pending={pending}
          />
        }
      />
    </>
  )
}

export default MonthlyStockTable
