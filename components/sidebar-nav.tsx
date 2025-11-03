"use client"

import { Home, Tag, Brain, Search, FileText, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IkuskiLogo } from "./ikuski-logo"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/", active: pathname === "/" },
    { icon: Tag, label: "Etiquetado", href: "/etiquetado", active: pathname === "/etiquetado" },
    { icon: Brain, label: "Entrenamiento", href: "/entrenamiento", active: pathname === "/entrenamiento" },
    { icon: Search, label: "Análisis", href: "/analisis", active: pathname === "/analisis" },
    { icon: FileText, label: "Informes", href: "/informes", active: pathname === "/informes" },
    { icon: Settings, label: "Configuración", href: "/configuracion", active: pathname === "/configuracion" },
  ]

  const handleLogout = () => {
    console.log("Logout clicked")
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <IkuskiLogo className="h-7 text-primary" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              JD
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">John Doe</div>
              <div className="text-muted-foreground">Engineer</div>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
