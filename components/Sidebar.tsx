"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { useTenant } from "@/hooks/useTenant"
import { useTurmasStore } from "@/stores/useTurmasStore"
import { useAlunosStore } from "@/stores/useAlunosStore"
import { useEffect, useState, useMemo } from "react"
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

import { LogOut, Menu, ArrowLeftRight } from "lucide-react"
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
  const { state, setOpenMobile } = useSidebar()
  const router = useRouter()

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
                <div className="font-semibold">
                  {user?.nome?.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className="text-muted-foreground">
                  {user?.email}
                </div>
              </div>

              {user?.roles?.length > 1 && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-9 text-xs mb-1"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/auth/select-role');
                  }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Trocar Perfil
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
              <div className="text-xs text-center text-muted-foreground mt-2">
                © 2026 Elo Escola
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {user?.roles?.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => {
                  setOpenMobile(false);
                  router.push('/auth/select-role');
                }} title="Trocar Perfil">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={logout} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </SidebarUI>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, activeRole } = useAuthStore()
  const { turmas, fetchTurmas } = useTurmasStore()
  const { alunos, fetchAlunosDoResponsavel } = useAlunosStore()
  const [mounted, setMounted] = useState(false)

  useTenant();

  useEffect(() => {
    if (mounted && user) {
      const currentRole = activeRole || user.roles[0];
      if (currentRole === 'PROFESSOR' && turmas.length === 0) {
        fetchTurmas();
      }
      if (currentRole === 'RESPONSAVEL' && alunos.length === 0) {
        fetchAlunosDoResponsavel();
      }
    }
  }, [mounted, user, activeRole, turmas.length, alunos.length, fetchTurmas, fetchAlunosDoResponsavel]);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return;

    // 1. Redir para seleção de papel se houver múltiplos e nenhum ativo
    if (user.roles.length > 1 && !activeRole && pathname !== '/auth/select-role' && !pathname.startsWith('/auth/')) {
      router.push('/auth/select-role');
      return;
    }

    // 2. Trava de Segurança por Perfil (Active Role Guard)
    const currentRole = activeRole || user.roles[0];

    const isAccessingWrongRole =
      (pathname.startsWith('/admin') && currentRole !== 'ADMIN') ||
      (pathname.startsWith('/professor') && currentRole !== 'PROFESSOR') ||
      (pathname.startsWith('/platform') && currentRole !== 'PLATFORM_ADMIN') ||
      (pathname.startsWith('/responsavel') && currentRole !== 'RESPONSAVEL');

    if (isAccessingWrongRole && pathname !== '/auth/select-role') {
      const rolePaths: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        PROFESSOR: '/professor/dashboard',
        PLATFORM_ADMIN: '/platform/escolas',
        RESPONSAVEL: '/responsavel/dashboard'
      };
      router.push(rolePaths[currentRole] || '/');
    }

    // 3. Forçar troca de senha no primeiro acesso
    if (user.primeiroAcesso && pathname !== '/auth/nova-senha' && pathname !== '/login') {
      router.push('/auth/nova-senha');
    }
  }, [mounted, user, activeRole, pathname, router]);

  const role = user ? (activeRole || user.roles[0]) : '';
  const items = useMemo(() => {
    if (!role) return [];

    let sidebarItems = getSidebarItems(role);

    // Regra: Ocultar Diários se a turma for TURNOINVERSO
    if (role === 'PROFESSOR' && turmas.length > 0) {
      // Verifica se o professor tem pelo menos uma turma que NÃO seja Turno Inverso
      const hasRegularTurma = turmas.some(t =>
        t.professores?.some(p => p.usuarioId === user?.id) &&
        t.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
      );
      if (!hasRegularTurma) {
        sidebarItems = sidebarItems.filter(item => item.id !== 'diarios');
      }
    }

    if (role === 'RESPONSAVEL' && alunos.length > 0) {
      // Verifica se o responsável tem pelo menos um filho que NÃO esteja no Turno Inverso
      const hasRegularAluno = alunos.some(a =>
        a.turma?.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
      );
      if (!hasRegularAluno) {
        sidebarItems = sidebarItems.filter(item => item.id !== 'diarios');
      }
    }

    return sidebarItems;
  }, [role, turmas, alunos, user?.id]);

  if (!mounted) {
    return <>{children}</>
  }

  if (pathname === '/login' || !isAuthenticated || !user) {
    return <>{children}</>
  }

  // Render regular sidebar
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
