'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import InputNumber from '@/components/inputNumber'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { handleError } from '@/utils/handleError'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import Add from '@iconify/icons-mdi/add'
import Remove from '@iconify/icons-mdi/remove'
import { Icon } from '@iconify/react/dist/offline'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

type src = { id: number; name: string }

const InventoryAdd: NextPage = () => {
  const { data, isLoading } = trpc.item.getAll.useQuery()
  const supplyMutation = trpc.supply.addToSupply.useMutation()

  const [srcList, setSrcList] = useState<src[]>([])
  const { month, year } = useDateStore()

  useEffect(() => {
    if (data && data?.length > 0)
      data.forEach((item) => {
        setSrcList((v) => {
          if (v.find((x) => x.id == item.id)) return v

          return [...v, { id: item.id, name: item.name }]
        })
      })
  }, [data])

  const [supply, setSupply] = useState<
    {
      src: src
      count: number
      pricePerUnit: number
    }[]
  >([])

  const add = () => {
    if (!srcList) return

    setSupply((v) => [
      ...v,
      {
        src: srcList[0],
        count: 0,
        pricePerUnit: 0
      }
    ])
  }

  const remove = (i: number) => {
    setSupply((v) => v.filter((_, index) => index != i))
  }

  const handleChange = (
    field: 'src' | 'count' | 'pricePerUnit',
    value: string,
    index: number
  ) => {
    setSupply((v) => {
      v = v.map((entry, i) => {
        if (index == i) {
          const x = srcList?.find(({ name }) => value == name)
          if (x) entry.src = x

          if (field == 'count' || field == 'pricePerUnit')
            entry[field] = parseFloat(value)
        }

        return entry
      })

      return v
    })
  }

  const save = async () => {
    try {
      await supplyMutation.mutateAsync({ supply, month, year })
      toast.success('تم الاضافة بنجاح')
      setSupply([])
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      <PageHeader title="اضافة للمخزون" subtitle={<DateSelector />} />

      {isLoading && <Loading />}

      {!isLoading && (
        <form
          onSubmit={save}
          className="flex flex-col gap-5 w-full overflow-x-auto py-2"
        >
          {supply.map(({ src, count, pricePerUnit }, i) => (
            <div className="flex gap-5 items-center" key={i}>
              <Button
                className="btn-primary -mb-5 btn-xs"
                onClick={() => remove(i)}
              >
                <Icon icon={Remove} width={20} />
              </Button>

              <div>
                <label className="label" htmlFor={`item_${i}`}>
                  العنصر
                </label>
                <select
                  className="select select-sm select-secondary w-[6rem]"
                  id={`item_${i}`}
                  onChange={(e) => handleChange('src', e.target.value, i)}
                  value={src?.name}
                >
                  {srcList?.map(({ id, name }) => (
                    <option key={id} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor={`count_${i}`}>
                  العدد
                </label>

                <InputNumber
                  className="bg-base-100 rounded-md border border-secondary input-secondary px-2 text-center w-[6rem]"
                  size="sm"
                  id={`count_${i}`}
                  value={count}
                  update={(v) => handleChange('count', v, i)}
                />
              </div>
              <div>
                <label className="label" htmlFor={`pricePerUnit_${i}`}>
                  سعر الوحدة
                </label>

                <InputNumber
                  className="bg-base-100 rounded-md border border-secondary input-secondary px-2 text-center w-[6rem]"
                  size="sm"
                  id={`pricePerUnit_${i}`}
                  value={pricePerUnit}
                  update={(v) => handleChange('pricePerUnit', v, i)}
                />
              </div>
              <div>
                <label className="label">الاجمالي</label>
                <span className="text-gray-300 h-8 block leading-8">
                  {new Intl.NumberFormat('en-US', {
                    maximumFractionDigits: 2
                  }).format(count * pricePerUnit)}
                </span>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            {supply.length > 0 && (
              <Button
                className="btn-sm"
                onClick={save}
                pending={supplyMutation.isLoading}
              >
                حفظ
              </Button>
            )}
            <Button
              className="btn-sm"
              onClick={add}
              disabled={supplyMutation.isLoading}
            >
              <Icon icon={Add} width={24} />
              اضافة
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default InventoryAdd
