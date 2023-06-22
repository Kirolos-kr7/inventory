"use client"

import Button from "@/components/button"
import Sidebar from "@/components/sidebar"
import { useStore } from "@/utils/store"
import Menu from "@iconify/icons-mdi/menu"
import { Icon } from "@iconify/react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { toggleSb } = useStore()

  return (
    <div className="flex min-h-[100lvh]">
      <Sidebar />

      <main className="w-full max-h-screen overflow-auto sm:w-[stretch] p-3 sm:p-5 pb-20 sm:pb-5">
        {children}
      </main>

      <Button
        className="btn-secondary btn-square flex items-center z-[29] rounded-full w-12 h-12 fixed shadow-xl right-5 bottom-5 btn-xs !p-1 sm:hidden"
        onClick={toggleSb}
      >
        <Icon icon={Menu} width={26} />
      </Button>
    </div>
  )
}
