"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAlunosStore } from "@/stores/useAlunosStore"
import { formatarNomeTurma } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Calendar, BookOpen, ChevronLeft, Phone, Mail } from "lucide-react"

export default function AlunoDetalhesPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)

    const {
        currentAluno,
        isLoading,
        error,
        getAlunoDetalhes,
    } = useAlunosStore()

    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                if (!isNaN(id)) {
                    await getAlunoDetalhes(id);
                }
            } finally {
                setIsInitializing(false);
            }
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    return (
        <RouteGuard allowedRoles={['PROFESSOR']}>
            <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detalhes do Aluno</h1>
                </div>

                {isLoading || isInitializing ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-gray-200 rounded-lg"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                        {error}
                    </div>
                ) : currentAluno ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Student Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-500" />
                                        Informações Pessoais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                                        <p className="text-lg font-medium text-gray-900">{currentAluno.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-4 h-4 ml-0" /> Data de Nascimento
                                        </p>
                                        <p className="text-lg text-gray-900">{new Date(currentAluno.dataNasc).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" /> Turma
                                        </p>
                                        <p className="text-lg text-gray-900">
                                            {currentAluno.turma ? `${formatarNomeTurma(currentAluno.turma.nome)}${currentAluno.turma.turno ? ` (${currentAluno.turma.turno})` : ''}` : 'Sem turma'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${currentAluno.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {currentAluno.isAtivo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Responsibles */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Responsáveis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {currentAluno.responsaveis?.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {currentAluno.responsaveis.map((resp) => (
                                                    <div key={resp.id} className="py-3">
                                                        <p className="font-medium text-gray-900">{resp.usuario.nome}</p>

                                                        <div className="mt-2 space-y-1">
                                                            {resp.usuario.telefone && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                    <span>{resp.usuario.telefone}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                <span>{resp.usuario.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">Nenhum responsável vinculado.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                        Aluno não encontrado.
                    </div>
                )}
            </div>
        </RouteGuard>
    )
}
