import Sidebar from "../components/Sidebar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="w-full sm:w-[stretch] p-5">{children}</main>
    </div>
  )
}
