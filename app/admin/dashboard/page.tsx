"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"
import { PageHeader } from "@/components/PageHeader";
import { StandardCard } from "@/components/StandardCard";
import { Button } from "@/components/ui/button";
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
      <div className="p-6 space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle={`Bem-vindo de volta, ${user?.nome?.split(' ')[0]}`}
        />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500">
          <StandardCard className="flex flex-col p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Atividades Pedagógicas</h3>
              </div>
              <AtividadesChart minimal={true} />
            </div>
            <div className="p-6 mt-auto border-t border-gray-50">
              <Button
                onClick={() => router.push("/admin/graficos/atividades")}
                className="w-full"
                variant="soft"
              >
                Detalhar
              </Button>
            </div>
          </StandardCard>

          <StandardCard className="flex flex-col p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Alunos por Turma</h3>
              </div>
              <AlunosChart minimal={true} />
            </div>
            <div className="p-6 mt-auto border-t border-gray-50">
              <Button
                onClick={() => router.push("/admin/graficos/alunos")}
                className="w-full"
                variant="soft"
              >
                Detalhar
              </Button>
            </div>
          </StandardCard>

          <StandardCard className="flex flex-col p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Balanço Financeiro</h3>
              </div>
              <MensalidadesChart minimal={true} />
            </div>
            <div className="p-6 mt-auto border-t border-gray-50">
              <Button
                onClick={() => router.push("/admin/financeiro")}
                className="w-full"
                variant="success"
              >
                Gerenciar Finanças
              </Button>
            </div>
          </StandardCard>
        </div>
      </div>
    </RouteGuard>
  )
}