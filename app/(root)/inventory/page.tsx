'use client'

import Button from '@/components/button'
import Confirmation from '@/components/confirmation'
import Dialog from '@/components/dialog'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { ItemWithCount } from '@/utils/types'
import Add from '@iconify/icons-mdi/add'
import { Icon } from '@iconify/react/offline'
import { Item } from '@prisma/client'
import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import AddItem from './addItem'
import History from './history'
import ItemCard from './itemCard'

const Inventory: NextPage = () => {
  const { month, year } = useDateStore()
  const [updatedData, setUpdatedData] = useState<ItemWithCount[]>()
  const [countTransactions, setCountTransactions] = useState<
    {
      itemId: number
      type: 'inc' | 'dec'
      by: number
    }[]
  >([])
  const [nameTransactions, setNameTransactions] = useState<
    {
      itemId: number
      newVal: string
      oldVal: string
    }[]
  >([])

  const countMutation = trpc.transaction.updateCounts.useMutation()
  const nameMutation = trpc.transaction.updateNames.useMutation()
  const { data, refetch, isLoading, isRefetching } = trpc.item.getAll.useQuery()
  const { data: bags } = trpc.donee.getCount.useQuery()

  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHistory, setIsHistory] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    if (data) setUpdatedData(structuredClone(data))
  }, [data])

  const changeCount = async (
    type: 'inc' | 'dec' | 'custom',
    id: number,
    value?: number
  ) => {
    setUpdatedData((v) => {
      if (typeof v !== 'undefined')
        v = v?.map((item) => {
          if (item.id == id) {
            type == 'inc' && item.count++
            type == 'dec' && item.count--
            type == 'custom' && value && (item.count = value)

            setCountTransactions((p) => {
              const isIn = p.find(({ itemId }) => itemId == item.id)

              if (isIn) p.splice(p.indexOf(isIn), 1)

              const diff = getCountDiff(item.id, item.count)

              return diff == 0
                ? p
                : [
                    ...p,
                    {
                      itemId: id,
                      type: diff < 0 ? 'dec' : 'inc',
                      by: Math.abs(diff)
                    }
                  ]
            })
          }

          return item
        })

      return v
    })
  }

  const changeName = async (id: number, value?: string) => {
    setUpdatedData((v) => {
      if (typeof v !== 'undefined')
        v = v?.map((item) => {
          if (item.id == id) {
            item.name = value || item.name

            setNameTransactions((p) => {
              const isIn = p.find(({ itemId }) => itemId == item.id)

              if (isIn) p.splice(p.indexOf(isIn), 1)

              return [
                ...p,
                {
                  itemId: id,
                  newVal: item.name,
                  oldVal: data?.find(({ id }) => id == item.id)?.name!
                }
              ]
            })
          }

          return item
        })

      return v
    })
  }

  const save = async () => {
    countTransactions.length > 0 &&
      (await countMutation.mutateAsync({
        transactions: countTransactions,
        month,
        year
      }))
    nameTransactions.length > 0 &&
      (await nameMutation.mutateAsync(nameTransactions))

    setCountTransactions([])
    setNameTransactions([])
    setIsEditing(false)
    await refetch()
  }

  const getCountDiff = (itemId: number, latestValue: number) => {
    const item = data?.find(({ id }) => id == itemId)!
    return latestValue - item?.count
  }

  const removeMutation = trpc.item.remove.useMutation()
  const removeItem = async () => {
    if (!selectedItem) return

    await removeMutation.mutateAsync(selectedItem.id)
    await refetch()
    setSelectedItem(null)
  }

  const pending = useMemo(
    () =>
      isLoading ||
      isRefetching ||
      countMutation.isLoading ||
      nameMutation.isLoading,
    [isLoading, isRefetching, countMutation, nameMutation]
  )

  return (
    <div>
      <PageHeader
        title="المخزون"
        actions={
          !isLoading && (
            <div className="flex gap-2">
              {isEditing && (
                <>
                  <Button
                    className="btn-error btn-sm sm:btn-md"
                    onClick={() => {
                      setUpdatedData(structuredClone(data))
                      setCountTransactions([])
                      setNameTransactions([])
                      setIsEditing(false)
                      setIsRemoving(false)
                    }}
                    disabled={pending}
                  >
                    الغاء
                  </Button>
                  <Button
                    className="btn-sm sm:btn-md"
                    pending={pending}
                    onClick={() => save()}
                    disabled={
                      countTransactions.length == 0 &&
                      nameTransactions.length == 0
                    }
                  >
                    حفظ
                  </Button>
                </>
              )}

              {isRemoving && (
                <>
                  <Button
                    className="btn-sm sm:btn-md"
                    onClick={() => {
                      setUpdatedData(structuredClone(data))
                      setIsRemoving(false)
                    }}
                  >
                    تم
                  </Button>
                </>
              )}

              {!isEditing && !isRemoving && (
                <>
                  <Button
                    className="btn-sm sm:btn-md"
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    تعديل
                  </Button>
                  <Button
                    className="btn-error btn-sm sm:btn-md"
                    onClick={() => setIsRemoving((v) => !v)}
                  >
                    حذف
                  </Button>
                </>
              )}
            </div>
          )
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {updatedData?.map((item) => (
            <div key={item.id}>
              <ItemCard
                item={item}
                bags={bags || 0}
                isEditing={isEditing}
                isRemoving={isRemoving}
                changeCount={changeCount}
                changeName={changeName}
                countChanged={
                  countTransactions.find(({ itemId }) => itemId == item.id)
                    ? true
                    : false
                }
                remove={() => setSelectedItem(item)}
                showHistory={() => (setIsHistory(true), setSelectedItem(item))}
                pending={pending}
              />
            </div>
          ))}
          {!isEditing && !isRemoving && (
            <button
              className="btn border-0 hover:bg-base-200/100 h-28 focus:bg-base-300 shadow-md min-h-16 flex items-center justify-center flex-col bg-base-300/80 relative rounded-md focus:ring-secondary-focus/80 focus:ring-offset-2 focus:ring-offset-base-100/20 focus:ring-4 focus:outline-none"
              onClick={() => setIsAdding(true)}
            >
              <Icon icon={Add} width={20} />
              <span className="mt-1 font-semibold">اضافة</span>
            </button>
          )}
        </div>
      )}

      <Dialog
        open={isAdding}
        header="اضافة عنصر"
        body={
          <AddItem
            done={async () => {
              await refetch()
              setIsAdding(false)
            }}
            pending={isRefetching}
          />
        }
        close={() => setIsAdding(false)}
      />

      <Dialog
        open={isRemoving && selectedItem != null}
        header="مسح عنصر"
        body={
          <Confirmation
            message="مسح هذا العنصر, هل انت متأكد؟"
            cta="مسح"
            accept={removeItem}
            pending={removeMutation.isLoading || isRefetching}
          />
        }
        close={() => setSelectedItem(null)}
      />

      <Dialog
        open={isHistory}
        header={
          <>
            العمليات السابقة
            <span className="text-gray-400 text-sm ms-2">
              [{selectedItem?.name}]
            </span>
          </>
        }
        body={<History item={selectedItem} />}
        close={() => (setIsHistory(false), setSelectedItem(null))}
      />
    </div>
  )
}

export default Inventory
