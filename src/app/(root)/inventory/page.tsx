"use client"

import { NextPage } from "next"
import { useEffect, useState } from "react"
import PageHeader from "../../components/PageHeader"
import { trpc } from "@/utils/trpc"
import ItemCard from "../../components/ItemCard"
import { Item } from "@prisma/client"
import { Icon } from "@iconify/react/offline"
import Add from "@iconify/icons-mdi/add"
import Dialog from "../../components/Dialog"
import AddItem from "../../components/dialogs/AddItem"
import Confirmation from "../../components/dialogs/Confirmation"
import History from "../../components/dialogs/History"

const Inventory: NextPage = () => {
  const [updatedData, setUpdatedData] = useState<Item[]>()
  const [countTransactions, setCountTransactions] = useState<
    {
      itemId: number
      type: "inc" | "dec"
      by: number
    }[]
  >([])
  const [nameTransactions, setNameTransactions] = useState<
    {
      itemId: number
      newValue: string
      oldValue: string
    }[]
  >([])

  const countMutation = trpc.transaction.updateCounts.useMutation()
  // const nameMutation = trpc.transaction.updateNames.useMutation()
  const { data, refetch } = trpc.item.getAll.useQuery()
  const { data: bags } = trpc.meta.get.useQuery("monthlyBags")

  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHistory, setIsHistory] = useState(false)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)

  useEffect(() => {
    if (data) setUpdatedData(structuredClone(data))
  }, [data])

  const changeCount = async (
    type: "inc" | "dec" | "custom",
    id: number,
    value?: number
  ) => {
    setUpdatedData((v) => {
      if (typeof v !== "undefined")
        v = v?.map((item) => {
          if (item.id == id) {
            type == "inc" && item.count++
            type == "dec" && item.count--
            type == "custom" && value && (item.count = value)

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
                      type: diff < 0 ? "dec" : "inc",
                      by: Math.abs(diff),
                    },
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
      if (typeof v !== "undefined")
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
                  newValue: item.name,
                  oldValue: data?.find(({ id }) => id == item.id)?.name!,
                },
              ]
            })
          }

          return item
        })

      return v
    })
  }

  const save = async () => {
    countMutation.mutate(countTransactions)
    // nameMutation.mutate(nameTransactions)

    setCountTransactions([])
    setNameTransactions([])
    setIsEditing(false)
    refetch()
  }

  const getCountDiff = (itemId: number, latestValue: number) => {
    const item = data?.find(({ id }) => id == itemId)!
    return latestValue - item?.count
  }

  const removeMutation = trpc.item.remove.useMutation()
  const removeItem = async () => {
    if (!selectedItem) return

    await removeMutation.mutateAsync(selectedItem)
    setSelectedItem(null)
    refetch()
  }

  return (
    <div>
      <PageHeader
        title="المخزون"
        actions={
          <div className="flex gap-2">
            {isEditing && (
              <>
                <button
                  className="btn btn-error"
                  onClick={() => {
                    setUpdatedData(structuredClone(data))
                    setIsEditing(false)
                    setIsRemoving(false)
                  }}
                >
                  الغاء
                </button>
                <button className="btn" onClick={() => save()}>
                  حفظ
                </button>
              </>
            )}

            {isRemoving && (
              <>
                <button
                  className="btn"
                  onClick={() => {
                    setUpdatedData(structuredClone(data))
                    setIsRemoving(false)
                  }}
                >
                  تم
                </button>
              </>
            )}

            {!isEditing && !isRemoving && (
              <>
                {" "}
                <button className="btn" onClick={() => setIsEditing((v) => !v)}>
                  تعديل
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => setIsRemoving((v) => !v)}
                >
                  حذف
                </button>
              </>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-4 gap-3 md:gap-5">
        {updatedData?.map((item) => (
          <div key={item.id}>
            <ItemCard
              item={item}
              bags={bags ? parseInt(bags) : 0}
              isEditing={isEditing}
              isRemoving={isRemoving}
              changeCount={changeCount}
              changeName={changeName}
              countChanged={
                countTransactions.find(({ itemId }) => itemId == item.id)
                  ? true
                  : false
              }
              remove={(id) => setSelectedItem(id)}
              showHistory={(id) => (setIsHistory(true), setSelectedItem(id))}
            />
          </div>
        ))}
        {!isRemoving && (
          <button
            className="btn btn-ghost hover:bg-base-300/80 h-full focus:bg-base-300/80 shadow-md min-h-16 flex items-center justify-center flex-col bg-base-300 relative rounded-md"
            onClick={() => setIsAdding(true)}
          >
            <Icon icon={Add} width={20} />
            <span className="mt-1 font-semibold">اضافة</span>
          </button>
        )}
      </div>

      <Dialog
        open={isAdding}
        header="اضافة عنصر"
        body={
          <AddItem
            done={() => {
              setIsAdding(false)
              refetch()
            }}
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
          />
        }
        close={() => setSelectedItem(null)}
      />

      <Dialog
        open={isHistory}
        header="العمليات السابقة"
        body={<History itemId={selectedItem} />}
        close={() => (setIsHistory(false), setSelectedItem(null))}
      />
    </div>
  )
}

export default Inventory
