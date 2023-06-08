"use client"

import Button from "@/components/Button"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { trpc } from "@/utils/trpc"
import { Icon } from "@iconify/react/dist/offline"
import Add from "@iconify/icons-mdi/add"
import Remove from "@iconify/icons-mdi/remove"
import { NextPage } from "next"
import { useEffect, useState } from "react"
import { handleError } from "@/utils/handleError"
import { MONTHS, currMonth, currYear } from "@/utils/dayjs"
import { toast } from "react-hot-toast"
import { yearList } from "@/utils/helpers"

type src = { id: number; name: string }

const InventoryAdd: NextPage = () => {
  const { data, isLoading } = trpc.item.getAll.useQuery()
  const supplyMutation = trpc.supply.addToSupply.useMutation()

  const [srcList, setSrcList] = useState<src[]>([])
  const [month, setMonth] = useState(currMonth)
  const [year, setYear] = useState(currYear)

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
        pricePerUnit: 0,
      },
    ])
  }

  const remove = (i: number) => {
    setSupply((v) => v.filter((_, index) => index != i))
  }

  const handleChange = (
    field: "src" | "count" | "pricePerUnit",
    value: string,
    index: number
  ) => {
    setSupply((v) => {
      v = v.map((entry, i) => {
        if (index == i) {
          const x = srcList?.find(({ name }) => value == name)
          if (x) entry.src = x

          if (field == "count" || field == "pricePerUnit")
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
      toast.success("تم الاضافة بنجاح")
      setSupply([])
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      <PageHeader
        title="اضافة للمخزون"
        subtitle={`${month} ${year}`}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                السنة
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
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
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
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
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <form onSubmit={save} className="flex flex-col gap-5">
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
                  dir="ltr"
                  className="select select-sm select-secondary w-[6rem]"
                  id={`item_${i}`}
                  onChange={(e) => handleChange("src", e.target.value, i)}
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
                <input
                  dir="ltr"
                  className="input-sm bg-base-100 rounded-md border border-secondary input-secondary px-2 text-center w-[6rem]"
                  type="number"
                  value={count}
                  onChange={(e) => handleChange("count", e.target.value, i)}
                  id={`count_${i}`}
                  min={1}
                />
              </div>
              <div>
                <label className="label" htmlFor={`pricePerUnit_${i}`}>
                  سعر الوحدة
                </label>
                <input
                  dir="ltr"
                  className="input-sm bg-base-100 rounded-md border border-secondary input-secondary px-2 text-center w-[6rem]"
                  type="number"
                  step="0.01"
                  value={pricePerUnit}
                  onChange={(e) =>
                    handleChange("pricePerUnit", e.target.value, i)
                  }
                  id={`pricePerUnit_${i}`}
                />
              </div>
              <div>
                <label className="label">الاجمالي</label>
                <span className="text-gray-300 h-8 block leading-8">
                  {count * pricePerUnit}
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
