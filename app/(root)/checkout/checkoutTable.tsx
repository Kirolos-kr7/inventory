import Button from '@/components/button'
import { CheckoutChange } from '@/utils/types'
import Filter from '@iconify/icons-mdi/filter-list'
import { Icon } from '@iconify/react/dist/offline'
import { Checkout, Donee, Item } from '@prisma/client'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

const CheckoutTable = ({
  data,
  items,
  donees,
  changes,
  checked,
  setChecked,
  update,
  openFilter
}: {
  data: Checkout[] | undefined
  items: Item[] | undefined
  donees: Donee[] | undefined
  changes: CheckoutChange[]
  checked: number[]
  setChecked: Dispatch<SetStateAction<number[]>>
  update: (doneeId: number, itemId: number, amount: number) => void
  openFilter: () => void
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const mainCHK = useRef<HTMLInputElement>(null)

  const handleResize = () => setIsMobile(window.innerWidth < 600)

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.addEventListener('resize', handleResize)
  }, [])

  const getCell = (dId: number, iId: number) => {
    const item = data?.find(
      ({ doneeId, itemId }) => dId == doneeId && itemId == iId
    )

    const changedItem = changes?.find(
      ({ doneeId, itemId }) => dId == doneeId && itemId == iId
    )

    return (
      <>
        <input
          type="number"
          className={`bg-transparent w-8 rounded-md text-center focus-within:bg-slate-600 ${
            changedItem ? '!bg-pink-900' : ''
          }`}
          value={item?.amount || 0}
          onChange={({ target }) => {
            const val = parseInt(target.value) || 0
            update(dId, iId, val)
            target.value = String(val)
          }}
          onFocus={(e) => e.target.select()}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          disabled={checked.length > 0}
        />
        <span className="hidden">{item?.amount || 0}</span>
      </>
    )
  }

  const getTakenItems = (id: number) => {
    let total = 0

    changes?.forEach(({ itemId, diff }) => {
      if (itemId == id) total += diff
    })

    return total
  }

  const getName = useCallback(
    (name: string) =>
      isMobile ? name.split(' ').splice(0, 2).join(' ') : name,
    [isMobile]
  )

  const didTake = useCallback(
    (dId: number) => data?.find(({ doneeId }) => doneeId == dId),
    [data]
  )

  useEffect(() => {
    if (!mainCHK.current) return

    if (checked.length == 0) {
      mainCHK.current.checked = false
      mainCHK.current.indeterminate = false
      return
    }

    const active = donees?.filter(({ id }) => !didTake(id))

    if (active?.length == checked.length) {
      mainCHK.current.checked = true
      mainCHK.current.indeterminate = false
      return
    }

    mainCHK.current.indeterminate = true
  }, [checked.length, donees, didTake, setChecked])

  const checkAll = () => {
    const items: NodeListOf<HTMLInputElement> | undefined = document
      .querySelector('tbody')
      ?.querySelectorAll('input[type="checkbox"]')

    if (!items) return

    setChecked(
      Array.from(items)
        .filter((x) => !x.disabled)
        .map(({ id }) => parseInt(id))
        .flat()
    )
  }

  return (
    <>
      <div
        className={`overflow-auto max-h-[calc(79lvh)] ${
          changes?.length > 0 ? 'mb-[4.6rem]' : 'mb-2'
        }`}
      >
        <table className="table w-full text-right">
          <thead>
            <tr className="[&>*]:first-of-type:rounded-t-none [&>*]:last-of-type:rounded-t-none sticky top-0 shadow-sm z-[12]">
              <th className="text-base">
                <div className="flex items-center gap-1 justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      ref={mainCHK}
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-secondary"
                      onChange={({
                        currentTarget: { checked, indeterminate }
                      }) => {
                        if (!checked) setChecked([])
                        else checkAll()
                      }}
                      disabled={changes.length > 0}
                    />
                    <div className="flex items-end gap-1">
                      <span>المخدوم</span>
                      {checked.length > 0}
                    </div>
                  </div>
                  <Button
                    className="btn-square btn-xs"
                    onClick={() => openFilter()}
                  >
                    <Icon icon={Filter} width={16} />
                  </Button>
                </div>
              </th>
              {items?.map(({ name, count, id }, i) => {
                const itemCount = count - getTakenItems(id)

                return (
                  <th key={i} className="text-sm px-3">
                    {name + ' '}
                    <span
                      className={`px-1 badge-neutral rounded-full me-1 inline-block ${
                        itemCount < 0 ? 'badge-error' : 'text-secondary'
                      }`}
                      dir="ltr"
                    >
                      <span className="hidden">(</span>
                      {itemCount}
                      <span className="hidden">)</span>
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {donees?.map(({ id: doneeId, name, isRegular }) => {
              const took = isRegular && didTake(doneeId)

              return (
                <tr key={doneeId} className={!isRegular ? 'not-regular' : ''}>
                  <th className="p-0">
                    <div className="relative p-4 flex items-center gap-2">
                      <span
                        className={`absolute start-0 w-1 h-4 rounded-e-md  inset-y-1/2 -translate-y-1/2 
                      ${took ? 'bg-green-400' : 'bg-secondary'}
                      ${isRegular ? '' : '!bg-red-400'}`}
                      />
                      <input
                        type="checkbox"
                        id={`${doneeId}`}
                        className="checkbox checkbox-xs checkbox-secondary"
                        checked={checked.includes(doneeId)}
                        onChange={() =>
                          setChecked((v) => {
                            if (v?.includes(doneeId))
                              return v.filter((n) => n != doneeId)
                            else return [...v, doneeId]
                          })
                        }
                        disabled={took || changes?.length > 0 ? true : false}
                      />
                      {getName(name)}
                    </div>
                  </th>

                  {items?.map(({ id: itemId }, i) => (
                    <td className="px-2" key={i}>
                      {getCell(doneeId, itemId)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CheckoutTable
