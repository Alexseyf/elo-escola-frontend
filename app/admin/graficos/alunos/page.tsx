"use client"

import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"
import AlunosChart from "@/app/admin/components/AlunosChart"

export default function AlunosGraficosPage() {

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-background pb-12">
        <PageHeader
          title="Estatísticas de Alunos"
          backHref="/admin/dashboard"
        />
        <div className="p-3 sm:p-6 max-w-7xl mx-auto">
          <Card className="mb-6 w-full">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Quantidade de Alunos por Turma</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <AlunosChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}
