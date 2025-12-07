"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getSidebarItems, type SidebarItem } from "@/utils/sidebarItems"

interface SidebarNavProps {
  items: SidebarItem[]
}

function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href
    }
    return pathname.startsWith(href.split("?")[0])
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
                      <Link href={item.href}>
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

interface AppSidebarProps {
  items: SidebarItem[]
}

function AppSidebar({ items }: AppSidebarProps) {
  const { state } = useSidebar()

  return (
    <SidebarUI>
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {state === "expanded" && (
            <h1 className="text-lg font-bold">Elo Escola</h1>
          )}
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarNav items={items} />

      <SidebarFooter>
        {state === "expanded" && (
          <p className="text-xs text-muted-foreground">
            © 2025 Elo Escola
          </p>
        )}
      </SidebarFooter>
    </SidebarUI>
  )
}

interface SidebarProps {
  role?: string
}

export function Sidebar({ role }: SidebarProps) {
  const items = role ? getSidebarItems(role) : []

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      {/* Trigger para mobile */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <SidebarTrigger />
      </div>
    </SidebarProvider>
  )
}
