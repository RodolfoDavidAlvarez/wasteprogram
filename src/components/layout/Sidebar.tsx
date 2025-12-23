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
  FileText,
  BarChart3,
  Leaf,
  AlertTriangle,
  Settings,
  Recycle,
  Scale,
  Handshake,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Deliveries", href: "/deliveries", icon: Truck },
  { name: "Deals", href: "/admin/deals", icon: Handshake },
  { name: "Scale House", href: "/admin/scale", icon: Scale },
  { name: "New Intake", href: "/admin/intake/new", icon: FileInput },
  { name: "Intakes", href: "/admin/intakes", icon: FileText },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Environmental Impact", href: "/admin/impact", icon: Leaf },
  { name: "Contamination Log", href: "/admin/contamination", icon: AlertTriangle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border min-h-screen">
      <div className="flex items-center h-16 px-4 bg-muted/50 border-b border-border">
        <Recycle className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-foreground">SSW Waste</span>
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
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground">
          Soil Seed & Water
          <br />
          Waste Diversion Program
        </div>
      </div>
    </div>
  )
}
