"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UpcomingEventsCard } from "@/components/responsavel/UpcomingEventsCard"
import { UltimosDiariosCard } from "@/components/responsavel/UltimosDiariosCard"
import { UltimaAtividadeCard } from "@/components/responsavel/UltimaAtividadeCard"
import { ProximosEventosTurmaCard } from "@/components/responsavel/ProximosEventosTurmaCard"
import { PageHeader } from "@/components/PageHeader"

export default function ResponsavelDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['RESPONSAVEL']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Visão Geral"
          subtitle={`Bem-vindo(a), ${user?.nome || user?.email || ''}`}
        />

        <div className="space-y-6">
          <UltimosDiariosCard />
          <UltimaAtividadeCard />
          <ProximosEventosTurmaCard />
          <UpcomingEventsCard />
        </div>
      </div>
    </RouteGuard>
  )
}
