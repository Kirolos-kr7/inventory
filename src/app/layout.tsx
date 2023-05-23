import { Cairo } from "next/font/google"
import "./globals.css"
import { TrpcProvider } from "@/utils/trpc-provider"
import { Toaster } from "react-hot-toast"

export const metadata = {
  title: "Inventory STK",
}

const CAIRO = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={CAIRO.className}>
      <body className="bg-base-200">
        <TrpcProvider>{children}</TrpcProvider>

        <Toaster />
      </body>
    </html>
  )
}
