"use client"

import { Icon } from "@iconify/react"
import Menu from "@iconify/icons-mdi/menu"
import Button from "../components/Button"
import { useStore } from "@/utils/store"
import Sidebar from "../components/Sidebar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { toggleSb } = useStore()

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="w-full sm:w-[stretch] p-5">{children}</main>
      <Button
        className="btn-ghost absolute right-5 top-7 btn-sm !px-2 sm:hidden block"
        onClick={toggleSb}
      >
        <Icon icon={Menu} width={28} />
      </Button>
    </div>
  )
}
