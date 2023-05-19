"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import Home from "@iconify/icons-mdi/home"
import Inventory from "@iconify/icons-mdi/package-variant"
import Bag from "@iconify/icons-mdi/bag-checked"
import Users from "@iconify/icons-mdi/users"
import Menu from "@iconify/icons-mdi/chevron-double-left"
import { deleteCookie } from "cookies-next"
import Image from "next/image"
import { useStore } from "@/utils/store"

const Sidebar = () => {
  const router = useRouter()
  const { sbOpened, toggleSb } = useStore()
  const { user, setUser } = useStore()
  const [userName, setUserName] = useState<string | undefined>(undefined)
  const [sideOpened, setSideOpened] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) toggleSb(false)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return window.addEventListener("resize", handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSideOpened(sbOpened)
  }, [sbOpened])

  useEffect(() => {
    setUserName(user?.name)
  }, [user])

  const sidebarItems = [
    {
      name: "الصفحة الرئيسية",
      to: "/",
      icon: Home,
    },
    {
      name: "المخزون",
      to: "/inventory",
      icon: Inventory,
    },
    {
      name: "الشنطة",
      to: "/bag",
      icon: Bag,
    },
    {
      name: "المستخدمين",
      to: "/users",
      icon: Users,
    },
  ]

  const logout = () => {
    setUser(null)
    deleteCookie("auth")
    router.push("/auth")
  }

  return (
    <aside
      className={`bg-base-100 !shrink-0 flex items-start flex-col fixed h-screen z-30 sm:static text-base-content transition-all ${
        sideOpened ? "w-full sm:w-60 md:w-72" : "w-0 sm:w-24 overflow-hidden"
      }`}
    >
      <ul className="menu gap-1 grow  p-2 pt-3 w-full">
        {sidebarItems.map(({ name, to, icon }) => (
          <li key={name}>
            <Link
              href={to}
              className={`truncate ${!sideOpened && "mx-auto"}`}
              prefetch={process.env.NODE_ENV == "production"}
            >
              <Icon icon={icon} width={28} />
              {sideOpened && name}
            </Link>
          </li>
        ))}
      </ul>

      <div
        className={`flex gap-2 p-4 w-full justify-between items-center ${
          !sideOpened && "flex-col"
        }`}
      >
        <div className="dropdown dropdown-top">
          <label tabIndex={0}>
            <button
              className={`btn btn-ghost focus:bg-transparent hover:bg-transparent ${
                sideOpened ? "w-36" : "!w-16"
              }`}
            >
              <div className="avatar flex items-center gap-2">
                <div className="w-12 rounded-full">
                  <Image
                    src="/user.jpg"
                    width={48}
                    height={48}
                    alt="user image"
                  />
                </div>
                {sideOpened && userName}
              </div>
            </button>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content bg-base-200 menu p-2 shadow mb-3 rounded-box w-52"
          >
            <li>
              <button onClick={logout}>تسجيل خروج</button>
            </li>
          </ul>
        </div>

        <button
          className={`btn mb-2 ${sideOpened ? "" : "btn-sm"}`}
          onClick={() => toggleSb()}
        >
          <Icon
            className={`transition-all ${
              !sideOpened ? "rotate-0" : "rotate-180"
            }`}
            icon={Menu}
            width={28}
          />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
