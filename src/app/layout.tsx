import { TrpcProvider } from "@/utils/trpc-provider"
import { Cairo } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata = {
  title: "St. Kriakos Coptic Orthozox Org",
  manifest: "/site.webmanifest",
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

        <Toaster toastOptions={{ className: "!bg-slate-600 !text-white" }} />
      </body>
    </html>
  )
}
