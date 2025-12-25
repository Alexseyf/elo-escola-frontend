"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { useTenant } from "@/hooks/useTenant"
import { useEffect, useState } from "react"
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getSidebarItems, type SidebarItem } from "@/utils/sidebarItems"

interface SidebarNavProps {
  items: SidebarItem[]
}

function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href
    }
    return pathname.startsWith(href.split("?")[0])
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  let lastDivider = false

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <div key={item.id}>
                  {item.divider && lastDivider === false && (
                    <Separator className="my-2" />
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href} onClick={handleLinkClick}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                  {item.divider && (lastDivider = true)}
                </div>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  items: SidebarItem[]
  logout: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}

function AppSidebar({ items, logout, user }: AppSidebarProps) {
  const { state } = useSidebar()

  return (
    <SidebarUI className="h-screen sticky top-0">
      <SidebarHeader className="flex items-start justify-between">
        <div className="flex gap-3">
          {state === "expanded" && (
            <img src="/logo_line.png" alt="logo" className="h-10 w-auto" />
          )}
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarNav items={items} />

      <SidebarFooter>
        <div className="p-4">
          {state === "expanded" ? (
             <div className="flex flex-col gap-2">
                <div className="text-xs font-medium truncate text-muted-foreground">
                   <div className="font-bold">
                      {user?.nome?.split(' ').slice(0, 2).join(' ')}
                   </div>
                   <div className="text-muted-foreground">
                      {user?.email}
                   </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full justify-center"
                  onClick={logout}
                >
                  Sair
                </Button>
                <div className="text-xs text-center text-muted-foreground mt-2">
                 © 2025 Elo Escola
                </div>
             </div>
          ) : (
             <Button variant="ghost" size="icon" onClick={logout} title="Sair">
                <LogOut className="h-4 w-4" />
             </Button>
          )}
        </div>
      </SidebarFooter>
    </SidebarUI>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  
  useTenant();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return <>{children}</> 
  }

  if (pathname === '/login' || !isAuthenticated || !user) {
    return <>{children}</>
  }

  const role = user.roles[0];
  const items = getSidebarItems(role);

  return (
    <SidebarProvider>
      <AppSidebar items={items} logout={useAuthStore.getState().logout} user={user} />
      <SidebarInset>
        <div className="md:hidden fixed top-4 left-4 z-40">
           <SidebarTrigger />
        </div>
        <div className="pt-12 md:pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
