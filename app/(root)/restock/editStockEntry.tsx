'use client'

import Button from '@/components/button'
import InputNumber from '@/components/inputNumber'
import { floatW2 } from '@/utils/helpers'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { SupplyWithSrc } from '@/utils/types'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'

const EditStockEntry = ({
  supply,
  done,
  pending
}: {
  supply: SupplyWithSrc | undefined
  done: () => Promise<void>
  pending?: boolean
}) => {
  const { data: srcList } = trpc.item.getAll.useQuery()
  const [selectedSrc, setSelectedSrc] = useState(
    supply ? supply.src.name : null
  )

  const { month, year } = useDateStore()

  const [values, setValues] = useState({
    count: supply?.count || 0,
    ppu: supply?.price || 0,
    total: (supply?.count || 0) * (supply?.price || 0)
  })

  const addMutation = trpc.supply.addToSupply.useMutation()
  const updateMutation = trpc.supply.update.useMutation()

  const submit = async () => {
    if (!selectedSrc) {
      toast.error('من فضلك اختر عنصر')
      return
    }

    const { count, ppu } = values
    const src = srcList?.find(({ name }) => selectedSrc == name)
    if (!src) return

    if (!supply?.id) {
      await addMutation.mutateAsync({
        month,
        year,
        supply: {
          count,
          pricePerUnit: ppu,
          src
        }
      })
      return
    }

    if (count == supply.count && ppu == supply.price) return

    await updateMutation.mutateAsync({
      id: supply?.id,
      count,
      oldCount: supply.count,
      pricePerUnit: ppu
    })
  }

  return (
    <>
      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault()
          await submit()
          toast.success('تم الحفظ')
          await done()
        }}
        className="flex flex-col gap-3"
      >
        <div className=" mt-3">
          <div className="flex items-center gap-2">
            <label className="label" htmlFor="item">
              العنصر
            </label>
            <select
              className="select bg-base-200 w-full"
              id="item"
              onChange={({ target }) => setSelectedSrc(target.value)}
              defaultValue={selectedSrc || 0}
              disabled={typeof supply != 'undefined'}
            >
              <option disabled value={0}>
                اختر عنصر
              </option>
              {srcList?.map(({ id, name }) => (
                <option key={id} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 mt-5">
            <div className="space-y-1.5 text-center">
              <label className="text-gray-400 text-sm" htmlFor="num">
                العدد
              </label>
              <InputNumber
                id="num"
                className="input input-sm w-full focus:outline-none focus:ring-1 ring-inset ring-gray-500/80 rounded-l-none text-center bg-base-200"
                value={values.count}
                update={(value) => {
                  setValues((v) => {
                    const count = parseInt(value)
                    const total = count * v.ppu
                    return { ...v, count, total }
                  })
                }}
              />
            </div>
            <div className="space-y-1.5 text-center">
              <label className="text-gray-400 text-sm" htmlFor="ppu">
                سعر الوحدة
              </label>
              <InputNumber
                id="ppu"
                className="input input-sm w-full focus:outline-none focus:ring-1 ring-inset ring-gray-500/80 rounded-r-none rounded-l-none text-center bg-base-200"
                value={values.ppu}
                update={(value) => {
                  setValues((v) => {
                    const ppu = floatW2(value)
                    const total = floatW2(ppu * v.count)
                    return { ...v, ppu, total }
                  })
                }}
              />
            </div>
            <div className="space-y-1.5 text-center">
              <label className="text-gray-400 text-sm" htmlFor="total">
                الاجمالي
              </label>
              <InputNumber
                id="total"
                className="input input-sm w-full focus:outline-none focus:ring-1 ring-inset ring-gray-500/80 rounded-r-none text-center bg-base-200"
                value={values.total}
                update={(value) => {
                  setValues((v) => {
                    const total = floatW2(value)
                    const ppu = floatW2(total / v.count)
                    return { ...v, total, ppu }
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {/* <Button type="submit" pending={pending || addMutation.isLoading}>
            اضافة اخر
          </Button> */}
          <Button type="submit" pending={pending || addMutation.isLoading}>
            حفظ
          </Button>
        </div>
      </form>
    </>
  )
}

export default EditStockEntry
