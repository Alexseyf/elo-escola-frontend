"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { ArrowLeft } from "lucide-react"
import AtividadesChart from "@/app/admin/components/AtividadesChart"

export default function GraficosPage() {
  const router = useRouter()

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="sm:inline">Voltar</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Gráficos e Estatísticas</h1>
        </div>

        <Card className="mb-6 w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Análise de Atividades</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <AtividadesChart />
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
