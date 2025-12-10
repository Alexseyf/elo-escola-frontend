"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="mb-6">Bem-vindo, {user?.nome?.split(' ')[0]}</p>
        
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Atividades Pedagógicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visualize estatísticas por turma.
              </p>
              <Button
                onClick={() => router.push("/admin/graficos")}
                className="w-full"
                variant="primary"
              >
                Acessar Gráficos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}
