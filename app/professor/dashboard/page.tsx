"use client"

import { useEffect, useMemo } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useTurmasStore, formatarNomeTurma } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import AtividadesChart from "@/app/admin/components/AtividadesChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfessorDashboard() {
  const user = useAuthStore((state) => state.user)
  const { turmas, fetchTurmas, isLoading } = useTurmasStore()

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  const profTurmas = useMemo(() =>
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Painel do Professor</h1>
          <p className="text-gray-500 mt-1">Olá, {user?.nome?.split(' ')[0]}</p>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium italic mt-2">Carregando dados...</p>
            </div>
          ) : profTurmas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">Você ainda não possui turmas vinculadas.</p>
            </div>
          ) : (
            profTurmas.map(turma => (
              <Card key={turma.id} className="w-full">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Análise de Atividades - {formatarNomeTurma(turma.nome)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AtividadesChart turmaId={turma.id} />
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </RouteGuard>
  )
}
