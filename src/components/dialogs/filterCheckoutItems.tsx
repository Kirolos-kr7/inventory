import { Item } from "@prisma/client"
import { FC } from "react"

interface FilterCheckoutItemsProps {
  items: (Item & { isActive: boolean })[]
  update: (id: number) => void
}

const FilterCheckoutItems: FC<FilterCheckoutItemsProps> = ({
  items,
  update,
}) => {
  return (
    <ul className="grid grid-cols-2">
      {items.map(({ id, name, isActive }) => (
        <li key={id}>
          <div className="flex gap-2 my-2 items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-secondary"
              defaultChecked={isActive}
              onChange={(e) => {
                update(id)
              }}
              id={`c_${id}`}
            />
            <label htmlFor={`c_${id}`}>{name}</label>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default FilterCheckoutItems
