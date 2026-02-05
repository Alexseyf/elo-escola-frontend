"use client"

import { useEffect, useState } from "react"
import { useTurmasStore } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { RelatorioDiarioDialog } from "../turmas/[id]/components/RelatorioDiarioDialog"

export default function RelatoriosPage() {
    const { fetchTurmas, turmas, isLoading } = useTurmasStore()

    useEffect(() => {
        fetchTurmas()
    }, [fetchTurmas])

    const turmasComDiario = turmas.filter(t => t.temDiarioClasse);

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="p-6 space-y-6">
                <PageHeader
                    title="Diários de Classe"
                    subtitle="Geração de relatórios de diário de classe"
                    backHref="/admin/dashboard"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Turmas com Diário Habilitado</CardTitle>
                        <CardDescription>Selecione uma turma para gerar o relatório mensal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {turmasComDiario.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma turma possui o diário de classe habilitado.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {turmasComDiario.map(turma => (
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
