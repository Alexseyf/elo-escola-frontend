"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UpcomingEventsCard } from "@/components/responsavel/UpcomingEventsCard"

export default function ResponsavelDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['RESPONSAVEL']}>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Visão Geral
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo(a), {user?.nome || user?.email}
          </p>
        </div>

        <div className="space-y-6">
          <UpcomingEventsCard />
        </div>
      </div>
    </RouteGuard>
  )
}
