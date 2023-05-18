import { Item } from "@prisma/client"
import { FormEvent, useState } from "react"
import { Icon } from "@iconify/react"
import Add from "@iconify/icons-mdi/add"
import Subrtact from "@iconify/icons-mdi/minus"

const BagContent = ({ items }: { items: Item[] | undefined }) => {
  const [content, setContent] = useState<Item[] | undefined>(
    structuredClone(items)
  )

  const change = (type: "inc" | "dec", id: number) => {
    setContent((v) => {
      if (!v) return undefined

      v = v.map((item) => {
        if (item.id == id) {
          if (type == "inc") item.perBag++
          if (type == "dec") item.perBag--
        }

        return item
      })

      return v
    })
  }

  const save = (e: FormEvent) => {
    e.preventDefault()

    console.log(e)
  }

  return (
    <>
      <form onSubmit={save} className="flex flex-col gap-3">
        {content?.map(({ id, name, perBag }) => (
          <div key={id} className="flex items-center justify-between gap-3">
            <label>{name}</label>
            <div className="flex justify-end">
              <button
                type="button"
                className="btn shrink w-10 btn-sm rounded-e-none"
                onClick={() => {
                  if (perBag < 99) change("inc", id)
                }}
              >
                <Icon icon={Add} width={18} />
              </button>
              <input
                type="number"
                className="input w-20 rounded-none text-center text-xl bg-base-200 input-sm"
                value={perBag}
                disabled
              />
              <button
                type="button"
                className="btn shrink btn-sm w-10 rounded-s-none"
                onClick={() => {
                  if (perBag > 0) change("dec", id)
                }}
              >
                <Icon icon={Subrtact} width={18} />
              </button>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex justify-end">
          <button className="btn mt-1">حفظ</button>
        </div>
      </form>
    </>
  )
}

export default BagContent
