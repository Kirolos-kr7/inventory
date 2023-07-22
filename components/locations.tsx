import Check from '@iconify/icons-mdi/check'
import { Icon } from '@iconify/react'

interface LocationsProps {
  locations:
    | {
        id: number
        name: string
      }[]
    | undefined
  active: {
    id: number
    name: string
    isActive: boolean
  }[]
  clickFunc: (id: number) => void
  contextFunc?: (id: number) => void
}

const Locations = ({
  locations,
  active,
  clickFunc,
  contextFunc
}: LocationsProps) => {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
        المنطقة
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        {locations?.map(({ id, name }) => (
          <li key={id}>
            <a
              onClick={() => clickFunc(id)}
              onContextMenu={(e) => {
                if (contextFunc) {
                  e.preventDefault()
                  contextFunc(id)
                }
              }}
            >
              {active.find(
                ({ id: lId, isActive }) => id == lId && isActive
              ) && <Icon className="text-secondary" icon={Check} />}
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Locations
