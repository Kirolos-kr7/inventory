import { DoneeFilterType } from '@/utils/types'
import { Item } from '@prisma/client'
import { FC } from 'react'

interface FilterCheckoutItemsProps {
  items: (Item & { isActive: boolean })[]
  doneeFilter: DoneeFilterType
  doneeFilterChanged: (v: DoneeFilterType) => void
  update: (id: number) => void
}

const FilterCheckoutItems: FC<FilterCheckoutItemsProps> = ({
  items,
  doneeFilter,
  doneeFilterChanged,
  update
}) => {
  return (
    <div className="-mt-4">
      <h2 className="text-xl mb-2 font-semibold">المخدومين</h2>
      <ul className="grid grid-cols-3"></ul>
      <div className="flex my-2">
        <button
          className="flex-1 btn btn-ghost btn-sm bg-slate-700 ring-inset rounded-none rounded-s-lg focus-visible:ring-2 ring-seondary outline-none p-2"
          onClick={() => doneeFilterChanged('all')}
          disabled={doneeFilter == 'all'}
        >
          الكل
        </button>
        <button
          className="flex-1 btn btn-ghost btn-sm bg-slate-700 ring-inset rounded-none focus-visible:ring-2 ring-seondary outline-none p-2"
          onClick={() => doneeFilterChanged('does')}
          disabled={doneeFilter == 'does'}
        >
          يصرف
        </button>
        <button
          className="flex-1 btn btn-ghost btn-sm bg-slate-700 ring-inset rounded-none focus-visible:ring-2 ring-seondary outline-none p-2"
          onClick={() => doneeFilterChanged('did')}
          disabled={doneeFilter == 'did'}
        >
          قام بالصرف
        </button>
        <button
          className="flex-1 btn btn-ghost btn-sm bg-slate-700 ring-inset rounded-none rounded-e-lg focus-visible:ring-2 ring-seondary outline-none p-2"
          onClick={() => doneeFilterChanged("didn't")}
          disabled={doneeFilter == "didn't"}
        >
          لم يصرف
        </button>
      </div>

      <h2 className="text-xl mb-2 font-semibold">العناصر</h2>
      <ul className="grid grid-cols-2">
        {items.map(({ id, name, isActive }) => (
          <li key={id}>
            <div className="flex gap-2 my-2 items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-secondary"
                defaultChecked={isActive}
                onChange={() => {
                  update(id)
                }}
                id={`c_${id}`}
              />
              <label htmlFor={`c_${id}`}>{name}</label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FilterCheckoutItems
