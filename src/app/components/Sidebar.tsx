"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Icon } from "@iconify/react"
import Home from "@iconify/icons-mdi/home"
import Inventory from "@iconify/icons-mdi/package-variant"
import Bag from "@iconify/icons-mdi/bag-checked"
import Users from "@iconify/icons-mdi/users"
import Menu from "@iconify/icons-mdi/chevron-double-left"
import { deleteCookie } from "cookies-next"
import Image from "next/image"

const Sidebar = () => {
  const router = useRouter()
  const [sideOpened, setSideOpened] = useState(true)

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
    deleteCookie("auth")
    router.push("/auth")
  }

  return (
    <aside
      className={`bg-base-100 flex items-start flex-col text-base-content transition-all overflow-hidden ${
        sideOpened ? "w-80" : "w-24"
      }`}
    >
      <h1 className="text-2xl m-4 font-semibold mb-5">الجمعية</h1>

      <ul className="menu gap-1 grow p-2 w-full">
        {sidebarItems.map(({ name, to, icon }) => (
          <li key={name}>
            <Link href={to} className={`${!sideOpened && "mx-auto"}`}>
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
              <div className="avatar flex items-center">
                <div className="w-12 rounded-full">
                  <Image
                    src="/user.jpg"
                    width={48}
                    height={48}
                    alt="user image"
                  />
                </div>
                {sideOpened && "Kirolos Rafaat"}
              </div>
            </button>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content bg-base-200 menu p-2 shadow mb-4 rounded-box w-52"
          >
            <li>
              <button onClick={logout}>تسجيل خروج</button>
            </li>
          </ul>
        </div>

        <button
          className={`btn ${sideOpened ? "" : "btn-sm"}`}
          onClick={() => setSideOpened((v) => !v)}
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
