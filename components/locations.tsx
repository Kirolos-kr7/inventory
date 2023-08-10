import { trpc } from '@/utils/trpc'
import { ActiveLocation } from '@/utils/types'
import Check from '@iconify/icons-mdi/check'
import { Icon } from '@iconify/react'
import { Dispatch, SetStateAction, useEffect } from 'react'

interface LocationsProps {
  active: ActiveLocation[]
  setActive: Dispatch<SetStateAction<ActiveLocation[]>>
}

const Locations = ({ active, setActive }: LocationsProps) => {
  const { data: locations } = trpc.donee.getLocations.useQuery()

  useEffect(() => {
    if (locations)
      setActive(() => locations.map((v) => ({ ...v, isActive: true })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

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
              onClick={() =>
                setActive((v) =>
                  v.map((loc) => {
                    if (loc.id == id) loc.isActive = !loc.isActive
                    return loc
                  })
                )
              }
              onContextMenu={(e) => {
                e.preventDefault()
                setActive((v) => {
                  const active = v.filter(({ isActive }) => isActive)
                  if (active.length == 1)
                    return v.map((loc) => {
                      loc.isActive = true
                      return loc
                    })

                  return v.map((loc) => {
                    if (loc.id == id) loc.isActive = true
                    else loc.isActive = false
                    return loc
                  })
                })
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
