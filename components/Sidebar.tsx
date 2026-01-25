"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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

import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  items: SidebarItem[]
  logout: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}

function MobileHeader() {
  const { toggleSidebar } = useSidebar()
  return (
    <header className="flex h-14 items-center border-b bg-white px-4 sticky top-0 z-20 md:hidden shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="-ml-2 hover:bg-gray-100"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </header>
  )
}

function AppSidebar({ items, logout, user }: AppSidebarProps) {
  const { state } = useSidebar()

  return (
    <SidebarUI className="h-screen sticky top-0">
      <SidebarHeader className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          {state === "expanded" && (
            <>
              <img src="/logo_line.png" alt="logo" className="h-10 w-auto" />
              {!user?.roles.includes('PLATFORM_ADMIN') && user?.school?.name && (
                <div className="text-xs font-semibold text-muted-foreground px-1">
                  {user.school.name}
                </div>
              )}
            </>
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
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useTenant();

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user?.primeiroAcesso && pathname !== '/auth/nova-senha' && pathname !== '/login') {
      router.push('/auth/nova-senha');
    }
  }, [mounted, user, pathname, router]);

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
        <MobileHeader />
        <div className="">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
