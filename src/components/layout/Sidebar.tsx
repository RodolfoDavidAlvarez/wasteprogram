"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileInput,
  Users,
  Truck,
  Calendar,
  BarChart3,
  Leaf,
  AlertTriangle,
  Settings,
  Recycle,
  Scale,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Scale House", href: "/scale", icon: Scale },
  { name: "New Intake", href: "/intake/new", icon: FileInput },
  { name: "Intakes", href: "/intakes", icon: Truck },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Environmental Impact", href: "/impact", icon: Leaf },
  { name: "Contamination Log", href: "/contamination", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center h-16 px-4 bg-gray-950">
        <Recycle className="h-8 w-8 text-emerald-500" />
        <span className="ml-2 text-xl font-bold text-white">SSW Waste</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          Soil Seed & Water
          <br />
          Waste Diversion Program
        </div>
      </div>
    </div>
  )
}
