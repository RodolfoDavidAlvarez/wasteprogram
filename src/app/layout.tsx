import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { headers } from "next/headers"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "SSW Waste Diversion",
  description: "Soil Seed & Water - Waste Diversion Program Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = headers().get("x-pathname") || ""
  const isPublicSchedule = pathname === "/schedule"

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-gray-100">
          {!isPublicSchedule && <Sidebar />}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
