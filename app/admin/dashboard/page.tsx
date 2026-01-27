"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { BarChart3, Users } from "lucide-react"
import AtividadesChart from "@/app/admin/components/AtividadesChart"
import AlunosChart from "@/app/admin/components/AlunosChart"
import MensalidadesChart from "@/app/admin/components/MensalidadesChart"

export default function AdminDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="mb-6">Bem-vindo, {user?.nome?.split(' ')[0]}</p>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Atividades Pedagógicas
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <AtividadesChart minimal={true} />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/admin/graficos/atividades")}
                className="w-full"
                variant="primary"
              >
                Detalhar
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Alunos por Turma
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <AlunosChart minimal={true} />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/admin/graficos/alunos")}
                className="w-full"
                variant="primary"
              >
                Detalhar
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Balanço Financeiro (Mês Atual)
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <MensalidadesChart minimal={true} />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/admin/financeiro")}
                className="w-full"
                variant="primary"
              >
                Gerenciar Finanças
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}