"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import Home from "@iconify/icons-mdi/home"
import Inventory from "@iconify/icons-mdi/package-variant"
import Bag from "@iconify/icons-mdi/bag-checked"
import Users from "@iconify/icons-mdi/users"
import Income from "@iconify/icons-mdi/arrow-left-bold-box"
import Expense from "@iconify/icons-mdi/arrow-right-bold-box"
import Stats from "@iconify/icons-mdi/table-large"
import Menu from "@iconify/icons-mdi/chevron-double-left"
import { deleteCookie } from "cookies-next"
import Image from "next/image"
import { useStore } from "@/utils/store"

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
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
      name: "الدخل",
      to: "/income",
      icon: Income,
    },
    {
      name: "المصاريف",
      to: "/expense",
      icon: Expense,
    },
    {
      name: "الجدول",
      to: "/stats",
      icon: Stats,
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
      className={`!shrink-0 fixed min-h-[100lvh] z-30 sm:static text-base-content transition-all sb ${
        sideOpened ? "w-full sm:w-60 md:w-72" : "w-0 sm:w-24"
      }`}
    >
      <div className="md:fixed bg-base-100 min-h-[100lvh] flex items-start flex-col justify-between">
        {" "}
        <div className="grow w-full">
          <ul className="menu gap-3 sm:gap-1 p-5 sm:p-2 sm:pt-3 grid sm:flex grid-cols-2 ">
            {sidebarItems.map(({ name, to, icon }) => (
              <li key={name}>
                <Link
                  href={to}
                  onClick={() => {
                    window.innerWidth <= 640 && setSideOpened(false)
                  }}
                  className={`flex flex-col sm:flex-row truncate border border-primary/20 sm:border-0 ${
                    !sideOpened && "mx-auto"
                  } ${pathname == to ? "text-secondary" : ""}`}
                  prefetch={process.env.NODE_ENV == "production"}
                >
                  <Icon icon={icon} width={28} />
                  {sideOpened && name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`flex gap-2 p-4 w-full justify-between items-center ${
            !sideOpened && "flex-col"
          }`}
        >
          <div className="dropdown dropdown-top ">
            <label tabIndex={0}>
              <button
                className={`btn btn-ghost px-0 focus:bg-transparent hover:bg-transparent ${
                  sideOpened ? "w-36 justify-start" : "!w-16"
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
              className="dropdown-content border border-base-300 bg-base-200 menu p-2 shadow-md mb-3 rounded-box w-52"
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
      </div>
    </aside>
  )
}

export default Sidebar
