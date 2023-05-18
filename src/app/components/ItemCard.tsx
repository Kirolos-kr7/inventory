"use client"

import { Item } from "@prisma/client"
import { Icon } from "@iconify/react"
import Add from "@iconify/icons-mdi/add"
import Subrtact from "@iconify/icons-mdi/minus"
import History from "@iconify/icons-mdi/history"
import Remove from "@iconify/icons-mdi/delete"
import { ChangeEvent } from "react"

const ItemCard: React.FC<{
  item: Item
  bags: number
  isEditing: boolean
  isRemoving: boolean
  changeCount: (
    type: "inc" | "dec" | "custom",
    id: number,
    value?: number
  ) => void
  changeName: (id: number, value?: string) => void
  countChanged: boolean
  remove: (id: number) => void
  showHistory: (id: number) => void
}> = ({
  item,
  bags,
  isEditing,
  isRemoving,
  changeCount,
  changeName,
  countChanged,
  remove,
  showHistory,
}) => {
  const { id, name, count, perBag } = item

  return (
    <div className="shadow-md bg-base-300 flex flex-col relative rounded-md">
      <progress
        className="progress progress-primary w-full"
        value={count}
        max={perBag * bags}
      />

      <div className="p-3 flex flex-col">
        <div className="font-semibold text-2xl mb-2">
          {!isEditing ? (
            <h2>{name}</h2>
          ) : (
            <input
              type="text"
              className="input w-full"
              defaultValue={name}
              onChange={(e: ChangeEvent) =>
                changeName(id, (e.target as HTMLInputElement).value)
              }
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2" dir="ltr">
          <div className="flex items-start">
            <input
              type="number"
              className={`bg-base-300 text-4xl font-black self-end ${
                countChanged && "text-secondary"
              }`}
              value={count}
              style={{ width: `${String(count).length}ch` }}
              onChange={(e) => {
                const el = e.target
                el.style.width = `${el.value.length}ch`
                changeCount("custom", id, parseInt(el.value))
              }}
              disabled={!isEditing && !isRemoving}
            />
            {countChanged && "*"}
          </div>

          {!isEditing && !isRemoving && (
            <button
              className="btn h-auto min-h-min rounded-full p-1"
              onClick={() => showHistory(id)}
            >
              <Icon icon={History} className="text-secondary" width={18} />
            </button>
          )}

          {isRemoving && (
            <button
              className="btn btn-error h-auto min-h-min rounded-full p-1"
              onClick={() => remove(id)}
            >
              <Icon icon={Remove} width={18} />
            </button>
          )}
        </div>

        {isEditing && (
          <div className="flex items-stretch mt-2 gap-2">
            <button
              className="btn shrink btn-sm w-full"
              onClick={() => count < 99 && changeCount("inc", id)}
            >
              <Icon icon={Add} width={24} />
            </button>
            <button
              className="btn shrink btn-sm w-full"
              onClick={() => count > 0 && changeCount("dec", id)}
            >
              <Icon icon={Subrtact} width={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard
