'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Dialog from '@/components/dialog'
import DownloadCsv from '@/components/downloadCsv'
import Loading from '@/components/loading'
import Locations from '@/components/locations'
import PageHeader from '@/components/pageHeader'
import { handleError } from '@/utils/handleError'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { CheckoutChange, DoneeFilterType } from '@/utils/types'
import { Checkout, Item } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'
import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import CheckoutTable from './checkoutTable'
import FilterCheckoutItems from './filterCheckoutItems'

const CheckoutPage: NextPage = () => {
  const { month, year } = useDateStore()
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [filterOpened, setFilterOpened] = useState(false)
  const [doneeFilter, setDoneeFilter] = useState<DoneeFilterType>('does')
  const [initial, setInitial] = useState(true)
  const [items, setItems] = useState<(Item & { isActive: boolean })[]>([])
  const [checked, setChecked] = useState<number[]>([])
  const [activeLocations, setActiveLocations] = useState<
    { id: number; name: string; isActive: boolean }[]
  >([])

  const { data: doneesData } = trpc.donee.getAll.useQuery()
  const { data: itemsData, refetch: refetchItems } = trpc.item.getAll.useQuery()
  const { data, isLoading, refetch, isRefetching } =
    trpc.checkout.getByMix.useQuery({
      month,
      year
    })

  const updateMutation = trpc.checkout.update.useMutation()
  const checkoutMutation = trpc.checkout.outBags.useMutation()

  useEffect(() => {
    if (data) setCheckouts(structuredClone(data))
  }, [data])

  useEffect(() => {
    if (itemsData)
      setItems((v) =>
        structuredClone(
          itemsData.map((item, i) => {
            if (initial) {
              setInitial(false)
              return {
                ...item,
                isActive: item.perBag > 0
              }
            } else
              return {
                ...item,
                isActive: v[i]?.isActive
              }
          })
        )
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          diff: amount - (original?.amount || 0)
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
          year
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
        year
      })
      refetch()
      refetchItems()
    } catch (err) {
      handleError(err)
    }
  }

  const checkoutBags = async () => {
    try {
      await checkoutMutation.mutateAsync({
        donees: checked,
        month,
        year
      })
      refetch()
      refetchItems()
      setChecked([])
    } catch (err) {
      handleError(err)
    }
  }

  const getFormattedCheckoutBags = () => {
    if (checked.length == 1) return `اخرج شنطة`
    if (checked.length == 2) return `اخرج شنطتين`
    if (checked.length > 1 && checked.length <= 10)
      return `اخرج ${checked.length} شنط`
    if (checked.length > 10) return `اخرج ${checked.length} شنطة`
  }

  return (
    <div>
      <PageHeader
        title="الصرف"
        subtitle={<DateSelector />}
        actions={
          <div className="flex gap-2 items-center">
            {!isLoading && (
              <DownloadCsv
                fileName={`الصرف ${month} ${year}`}
                disabled={changes.length > 0}
              />
            )}

            <Locations
              active={activeLocations}
              setActive={setActiveLocations}
            />
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
            checked={checked}
            setChecked={setChecked}
            donees={getDonees()}
            update={update}
            openFilter={() => setFilterOpened(true)}
            doneeFilter={doneeFilter}
            resetDoneeFilter={() => setDoneeFilter('all')}
          />

          <AnimatePresence>
            {(changes.length > 0 || checked.length > 0) && (
              <motion.div
                initial={{ translateY: '500px' }}
                animate={{ translateY: '0px' }}
                exit={{ translateY: '500px' }}
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.6
                }}
                className="flex gap-2 my-2 fixed left-5 border border-base-300 shadow-lg bottom-3 p-3 bg-base-100 rounded-xl"
              >
                <Button
                  className="btn-sm btn-error"
                  onClick={() => {
                    setCheckouts(
                      data && data?.length > 0 ? structuredClone(data) : []
                    )
                    setChecked([])
                  }}
                  disabled={
                    updateMutation.isLoading ||
                    checkoutMutation.isLoading ||
                    isRefetching
                  }
                >
                  الغاء
                </Button>
                {changes.length > 0 && (
                  <Button
                    className="btn-sm"
                    onClick={save}
                    pending={
                      updateMutation.isLoading ||
                      checkoutMutation.isLoading ||
                      isRefetching
                    }
                  >
                    حفظ
                  </Button>
                )}
                {checked.length > 0 && (
                  <Button
                    className="btn-sm"
                    onClick={checkoutBags}
                    pending={
                      updateMutation.isLoading ||
                      checkoutMutation.isLoading ||
                      isRefetching
                    }
                  >
                    {getFormattedCheckoutBags()}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {items && (
        <Dialog
          open={filterOpened}
          header=""
          body={
            <FilterCheckoutItems
              items={items}
              doneeFilter={doneeFilter}
              doneeFilterChanged={(v) => setDoneeFilter(v)}
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

export default CheckoutPage
