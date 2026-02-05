"use client"

import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"
import AtividadesChart from "@/app/admin/components/AtividadesChart"

export default function AtividadesGraficosPage() {

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Análise de Atividades"
          backHref="/admin/dashboard"
        />
        <Card>
          <CardHeader>
            <CardTitle>Atividades Pedagógicas por Campo de Experiência</CardTitle>
          </CardHeader>
          <CardContent>
            <AtividadesChart />
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
