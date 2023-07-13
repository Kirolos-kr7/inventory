import Button from '@/components/button'
import InputNumber from '@/components/inputNumber'
import { trpc } from '@/utils/trpc'
import Add from '@iconify/icons-mdi/add'
import Subrtact from '@iconify/icons-mdi/minus'
import { Icon } from '@iconify/react'
import { Item } from '@prisma/client'
import { FormEvent, useState } from 'react'

const BagContent = ({
  items,
  done
}: {
  items: Item[] | undefined
  done: (isChanged: boolean) => Promise<void>
}) => {
  const [pending, setPending] = useState(false)
  const [bagTransactions, setBagTransactions] = useState<
    {
      itemId: number
      type: 'inc' | 'dec'
      by: number
    }[]
  >([])
  const [content, setContent] = useState<Item[] | undefined>(
    structuredClone(items)
  )
  const bagMutation = trpc.transaction.updateBag.useMutation()

  const change = (type: 'inc' | 'dec', id: number) => {
    setContent((v) => {
      if (!v) return undefined

      v = v.map((item) => {
        if (item.id == id) {
          if (type == 'inc') item.perBag++
          if (type == 'dec') item.perBag--

          setBagTransactions((p) => {
            const isIn = p.find(({ itemId }) => itemId == item.id)

            if (isIn) p.splice(p.indexOf(isIn), 1)

            const diff = getPerBagDiff(item.id, item.perBag)

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

  const save = async (e: FormEvent) => {
    e.preventDefault()

    if (bagTransactions.length > 0) {
      setPending(true)
      await bagMutation.mutateAsync(bagTransactions)
    }
    await done(bagTransactions.length > 0)
    setPending(false)
  }

  const getPerBagDiff = (itemId: number, latestValue: number) => {
    const item = items?.find(({ id }) => id == itemId)!
    return latestValue - item?.perBag
  }

  return (
    <>
      <form onSubmit={save} className="flex flex-col gap-3">
        {content?.map(({ id, name, perBag }) => (
          <div key={id} className="flex items-center justify-between gap-3">
            <label htmlFor={name}>{name}</label>
            <div className="flex justify-end">
              <button
                type="button"
                className="btn shrink w-10 btn-sm rounded-e-none"
                onClick={() => {
                  if (perBag < 99) change('inc', id)
                }}
              >
                <Icon icon={Add} width={18} />
              </button>
              <InputNumber
                id={name}
                className="w-20 h-min rounded-none text-center text-xl bg-base-200"
                size="sm"
                value={perBag}
                disabled
              />
              <button
                type="button"
                className="btn shrink btn-sm w-10 rounded-s-none"
                onClick={() => {
                  if (perBag > 0) change('dec', id)
                }}
              >
                <Icon icon={Subrtact} width={18} />
              </button>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex justify-end">
          <Button type="submit" className="mt-1" pending={pending}>
            حفظ
          </Button>
        </div>
      </form>
    </>
  )
}

export default BagContent
