'use client';

import { useState, useEffect, useMemo } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { PageHeader } from '@/components/PageHeader';

export default function ProfessorChamadaSelectionPage() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const turmas = useTurmasStore(state => state.turmas);
    const fetchTurmas = useTurmasStore(state => state.fetchTurmas);
    const loadingTurmas = useTurmasStore(state => state.isLoading);

    useEffect(() => {
        if (turmas.length === 0) {
            fetchTurmas();
        }
    }, [fetchTurmas, turmas.length]);

    const profTurmas = useMemo(() =>
        turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id) && t.temDiarioClasse),
        [turmas, user?.id]
    );

    return (
        <RouteGuard allowedRoles={['PROFESSOR']}>
            <div className="p-6 space-y-6">
                <PageHeader
                    title="Realizar Chamada"
                    subtitle="Selecione uma turma para registrar a frequência"
                    backHref="/professor/dashboard"
                />

                {/* Content */}
                {loadingTurmas ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Carregando turmas...</p>
                    </div>
                ) : profTurmas.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="text-gray-300 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Nenhuma turma atribuída</h3>
                        <p className="text-gray-500 mt-2">Você ainda não foi atribuído a nenhuma turma.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profTurmas.map(turma => (
                            <Card
                                key={turma.id}
                                className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                                onClick={() => router.push(`/professor/turmas/${turma.id}/chamada`)}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex justify-between items-center">
                                        {formatarNomeTurma(turma.nome)}
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </CardTitle>
                                    <CardDescription>
                                        Chamada Habilitada
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {turma.alunos?.length || 0} {turma.alunos?.length === 1 ? 'aluno' : 'alunos'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
