'use client'

import { useStore } from '@/utils/store'
import Donee from '@iconify/icons-mdi/account-cash'
import Bag from '@iconify/icons-mdi/bag-checked'
import Menu from '@iconify/icons-mdi/chevron-double-left'
import Stats from '@iconify/icons-mdi/finance'
import Home from '@iconify/icons-mdi/home'
import Checkout from '@iconify/icons-mdi/money'
import Inventory from '@iconify/icons-mdi/package-variant'
import InventoryAdd from '@iconify/icons-mdi/package-variant-add'
import Supply from '@iconify/icons-mdi/table'
import User from '@iconify/icons-mdi/user'
import Users from '@iconify/icons-mdi/users'
import { Icon } from '@iconify/react'
import { deleteCookie } from 'cookies-next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { sbOpened, toggleSb } = useStore()
  const { user, setUser } = useStore()
  const [userName, setUserName] = useState<string | undefined>(undefined)
  const [sideOpened, setSideOpened] = useState(false)
  const [initail, setInitail] = useState(true)

  useEffect(() => {
    if (window.innerWidth < 640) toggleSb(false)
    setInitail(false)
  }, [toggleSb])

  useEffect(() => {
    if (initail && window.innerWidth < 640) return
    setSideOpened(sbOpened)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sbOpened])

  useEffect(() => {
    if (user) setUserName(user.name)
  }, [user])

  const sidebarItems = [
    {
      name: 'الصفحة الرئيسية',
      to: '/',
      icon: Home
    },
    {
      group: 'المخزون',
      name: 'إدارة',
      to: '/inventory',
      icon: Inventory
    },
    {
      name: 'إضافة',
      to: '/inventory-add',
      icon: InventoryAdd
    },
    {
      name: 'الشنطة',
      to: '/bag',
      icon: Bag
    },
    {
      group: 'الجداول',
      name: 'الصرف',
      to: '/checkout',
      icon: Checkout
    },
    {
      name: 'المالية',
      to: '/stats',
      icon: Stats
    },
    {
      name: 'التموين',
      to: '/supply',
      icon: Supply
    },
    {
      group: 'إدارة الاشخاص',
      name: 'المخدومين',
      to: '/donee',
      icon: Donee
    },
    {
      name: 'المستخدمين',
      to: '/users',
      icon: Users
    }
  ]

  const logout = () => {
    setUser(null)
    deleteCookie('auth')
    router.push('/auth')
  }

  return (
    <aside
      className={`!shrink-0 fixed min-h-[100lvh] z-30 sm:static text-base-content transition-all sb ${
        sideOpened ? 'w-full sm:w-60 md:w-72' : 'w-0 sm:w-24'
      }`}
    >
      <div className="sm:fixed bg-base-100 h-[100lvh] w-[inherit] flex items-start flex-col justify-between">
        <div className="grow w-full overflow-y-auto">
          <ul className="menu gap-3 sm:gap-1 p-3 sm:p-2 sm:pt-3 grid sm:flex grid-cols-2 ">
            {sidebarItems.map(({ name, to, icon, group }) => (
              <Fragment key={name}>
                {group && (
                  <>
                    {sideOpened ? (
                      <li className="text-gray-400 px-3 mt-2.5 mb-1 hidden sm:flex">
                        {group}
                      </li>
                    ) : (
                      <li />
                    )}
                  </>
                )}
                <li>
                  <Link
                    href={to}
                    onClick={() => {
                      window.innerWidth <= 640 && setSideOpened(false)
                    }}
                    className={`flex flex-col sm:flex-row truncate border border-primary/20 sm:border-0 ${
                      !sideOpened && 'mx-auto'
                    } ${pathname == to ? 'text-secondary' : ''}`}
                  >
                    <Icon icon={icon} width={28} />
                    {sideOpened && name}
                  </Link>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
        <div
          className={`flex gap-2 p-3 w-full items-center ${
            !sideOpened ? 'flex-col justify-end' : 'justify-between'
          }`}
        >
          <div className="dropdown dropdown-top ">
            <label tabIndex={0}>
              <button
                className={`btn btn-ghost px-0 focus:bg-transparent hover:bg-transparent ${
                  sideOpened ? 'w-36 justify-start' : '!w-16'
                }`}
              >
                <div className="avatar flex items-center gap-2">
                  <div className="rounded-full bg-white text-base-100/90 p-1">
                    <Icon icon={User} width={38} height={38} />
                  </div>
                  {sideOpened && userName}
                </div>
              </button>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content border border-base-300 bg-base-200 menu p-2 shadow-md mb-3 rounded-box w-52"
            >
              <li>
                <button onClick={logout}>تسجيل خروج</button>
              </li>
            </ul>
          </div>

          <button
            className={`btn ${sideOpened ? '' : 'btn-sm'}`}
            onClick={() => toggleSb()}
          >
            <Icon
              className={`transition-all ${
                !sideOpened ? 'rotate-0' : 'rotate-180'
              }`}
              icon={Menu}
              width={28}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
