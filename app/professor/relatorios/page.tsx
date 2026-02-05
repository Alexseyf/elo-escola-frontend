"use client"

import { useEffect, useMemo } from "react"
import { useTurmasStore } from "@/stores/useTurmasStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { RelatorioDiarioDialog } from "@/app/admin/turmas/[id]/components/RelatorioDiarioDialog"

export default function ProfessorRelatoriosPage() {
    const { fetchTurmas, turmas, isLoading } = useTurmasStore()
    const user = useAuthStore(state => state.user)

    useEffect(() => {
        fetchTurmas()
    }, [fetchTurmas])

    const profTurmas = useMemo(() =>
        turmas.filter(t =>
            t.professores?.some(p => p.usuarioId === user?.id) &&
            t.temDiarioClasse
        ),
        [turmas, user?.id]
    );

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <RouteGuard allowedRoles={['PROFESSOR']}>
            <div className="p-6 space-y-6">
                <PageHeader
                    title="Diários de Classe"
                    subtitle="Meus relatórios de diário de classe"
                    backHref="/professor/dashboard"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Minhas Turmas</CardTitle>
                        <CardDescription>Selecione uma turma para visualizar o diário de classe</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {profTurmas.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma turma com diário habilitado encontrada para você.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profTurmas.map(turma => (
                                    <Card key={turma.id} className="bg-gray-50 border shadow-sm">
                                        <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{turma.nome}</h3>
                                                    <p className="text-sm text-gray-500">Ano: {turma.ano}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {turma.alunos?.length || 0} alunos matriculados
                                                    </p>
                                                </div>
                                            </div>

                                            <RelatorioDiarioDialog
                                                turmaId={turma.id}
                                                turmaNome={turma.nome}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RouteGuard>
    )
}
