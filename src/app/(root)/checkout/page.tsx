"use client"

import Button from "@/components/Button"
import CheckoutTable from "@/components/CheckoutTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { MONTHS, currMonth, currYear } from "@/utils/dayjs"
import { handleError } from "@/utils/handleError"
import { yearList } from "@/utils/helpers"
import { trpc } from "@/utils/trpc"
import Check from "@iconify/icons-mdi/check"
import { Icon } from "@iconify/react"
import { NextPage } from "next"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { Checkout, Item } from "@prisma/client"
import { CheckoutChange } from "@/utils/types"
import Dialog from "@/components/Dialog"
import FilterCheckoutItems from "@/components/dialogs/filterCheckoutItems"

const Checkout: NextPage = () => {
  const [month, setMonth] = useState(currMonth)
  const [year, setYear] = useState(currYear)
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [filterOpened, setFilterOpened] = useState(false)
  const [items, setItems] = useState<(Item & { isActive: boolean })[]>([])
  const [activeLocations, setActiveLocations] = useState<
    { id: number; name: string; isActive: boolean }[]
  >([])

  const { data: doneesData } = trpc.donee.getAll.useQuery()
  const { data: locations } = trpc.donee.getLocations.useQuery()
  const { data: itemsData, refetch: refetchItems } = trpc.item.getAll.useQuery()
  const { data, isLoading, refetch, isRefetching } =
    trpc.checkout.getByMix.useQuery({
      month,
      year,
    })

  const updateMutation = trpc.checkout.update.useMutation()

  useEffect(() => {
    if (locations)
      setActiveLocations(() => locations.map((v) => ({ ...v, isActive: true })))
  }, [locations])

  useEffect(() => {
    if (data) setCheckouts(structuredClone(data))
  }, [data])

  useEffect(() => {
    if (itemsData)
      setItems(
        structuredClone(
          itemsData.map((item) => {
            return { ...item, isActive: true }
          })
        )
      )
  }, [itemsData])

  const getDonees = () => {
    return doneesData?.filter(({ location }) =>
      activeLocations.find(({ id, isActive }) => location.id == id && isActive)
    )
  }

  const changes = useMemo(() => {
    const diff: CheckoutChange[] = []

    checkouts.forEach(({ doneeId, itemId, amount }) => {
      const found = data?.find(
        ({ doneeId: x, itemId: y, amount: z }) =>
          doneeId == x && itemId == y && amount == z
      )

      const original = data?.find(
        ({ doneeId: x, itemId: y }) => doneeId == x && itemId == y
      )

      if (!found)
        diff.push({
          doneeId,
          itemId,
          amount,
          diff: amount - (original?.amount || 0),
        })
    })

    return diff
  }, [checkouts, data])

  const update = async (doneeId: number, itemId: number, amount: number) => {
    setCheckouts((v) => {
      if (
        amount == 0 &&
        !data?.find(({ doneeId: x, itemId: y }) => doneeId == x && itemId == y)
      ) {
        v = v.filter(({ doneeId: x, itemId: y }) => doneeId != x || itemId != y)

        return v
      }

      const found = v.find(
        ({ doneeId: x, itemId: y }) => doneeId == x && itemId == y
      )
      if (!found)
        v.push({
          doneeId,
          itemId,
          amount,
          month,
          year,
        })
      v = v.map((c) => {
        if (c.doneeId == doneeId && c.itemId == itemId) c.amount = amount
        return c
      })

      return v
    })
  }

  const save = async () => {
    try {
      await updateMutation.mutateAsync({
        changes,
        month,
        year,
      })
      refetch()
      refetchItems()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      <PageHeader
        title="الصرف"
        subtitle={`${month} ${year}`}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                السنة
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
              >
                {yearList().map((n) => (
                  <li key={n}>
                    <a
                      className={n == year ? "active" : ""}
                      onClick={() => setYear(n)}
                    >
                      {n}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                الشهر
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
                dir="rtl"
              >
                {MONTHS.map((n) => (
                  <li key={n}>
                    <a
                      className={n == month ? "active" : ""}
                      onClick={() => setMonth(n)}
                    >
                      {n}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dropdown" dir="rtl">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                المنطقة
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                {locations?.map(({ id, name }) => (
                  <li key={id}>
                    <a
                      onClick={() =>
                        setActiveLocations((v) =>
                          v.map((loc) => {
                            if (loc.id == id) loc.isActive = !loc.isActive
                            return loc
                          })
                        )
                      }
                    >
                      {activeLocations.find(
                        ({ id: lId, isActive }) => id == lId && isActive
                      ) && <Icon className="text-secondary" icon={Check} />}
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <>
          <CheckoutTable
            data={checkouts}
            items={items.filter(({ isActive }) => isActive)}
            changes={changes}
            donees={getDonees()}
            update={update}
            openFilter={() => setFilterOpened(true)}
          />

          <AnimatePresence>
            {changes.length > 0 && (
              <motion.div
                initial={{ translateY: "500px" }}
                animate={{ translateY: "0px" }}
                exit={{ translateY: "500px" }}
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
                className="flex gap-2 my-2 fixed left-5 border border-base-300 shadow-lg bottom-3 p-3 bg-base-100 rounded-xl"
              >
                <Button
                  className="btn-sm btn-error"
                  onClick={() =>
                    data?.length && setCheckouts(structuredClone(data))
                  }
                  disabled={updateMutation.isLoading || isRefetching}
                >
                  الغاء
                </Button>
                <Button
                  className="btn-sm"
                  onClick={save}
                  pending={updateMutation.isLoading || isRefetching}
                >
                  حفظ
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {items && (
        <Dialog
          open={filterOpened}
          header="اختار العناصر"
          body={
            <FilterCheckoutItems
              items={items}
              update={(id) => {
                setItems((v) => {
                  v = v.map((item) => {
                    const { id: x, isActive } = item
                    if (id == x) item.isActive = !isActive

                    return item
                  })

                  return v
                })
              }}
            />
          }
          close={() => setFilterOpened(false)}
        />
      )}
    </div>
  )
}

export default Checkout
