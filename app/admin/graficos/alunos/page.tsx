"use client"

import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"
import AlunosChart from "@/app/admin/components/AlunosChart"

export default function AlunosGraficosPage() {

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Estatísticas de Alunos"
          backHref="/admin/dashboard"
        />
        <Card>
          <CardHeader>
            <CardTitle>Quantidade de Alunos por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <AlunosChart />
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
