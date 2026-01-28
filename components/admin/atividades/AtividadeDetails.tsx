'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAtividadesStore } from '@/stores/useAtividadesStore';
import { formatarNomeTurma } from '@/stores/useTurmasStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { SEMESTRE_LABELS } from '@/types/atividades';
import { ArrowLeft, Calendar, Clock, BookOpen, Target, User } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

export default function AtividadeDetails() {
    const params = useParams();
    const router = useRouter();
    const { atividadeAtual, isLoading, error, fetchAtividadeById } = useAtividadesStore();

    useEffect(() => {
        if (params.id) {
            fetchAtividadeById(Number(params.id));
        }
    }, [params.id, fetchAtividadeById]);

    const formatarData = (data: string) => {
        return data.slice(8, 10) + '/' + data.slice(5, 7) + '/' + data.slice(0, 4);
    };

    if (isLoading) {
        return (
            <RouteGuard allowedRoles={['ADMIN']}>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium mt-4">Carregando atividade...</p>
                </div>
            </RouteGuard>
        );
    }

    if (error || !atividadeAtual) {
        return (
            <RouteGuard allowedRoles={['ADMIN']}>
                <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            <p>{error || 'Atividade não encontrada'}</p>
                            <Button
                                variant="link"
                                onClick={() => router.back()}
                                className="mt-2 text-red-700 hover:text-red-800 p-0 h-auto"
                            >
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50/50 pb-8">
                <PageHeader
                    title="Detalhes da Atividade"
                    subtitle="Informações completas da atividade pedagógica"
                    backHref={() => router.back()}
                />
                <div className="max-w-4xl mx-auto space-y-6 pt-6 px-4 md:px-8">

                    {/* Content */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Ano e Período */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">Ano</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{atividadeAtual.ano}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">Período</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {SEMESTRE_LABELS[atividadeAtual.periodo]}
                                    </p>
                                </div>
                            </div>

                            {/* Data e Horas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">Data de Realização</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatarData(atividadeAtual.data)}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-medium">Quantidade de Horas</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{atividadeAtual.quantHora}h</p>
                                </div>
                            </div>

                            {/* Turma */}
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-medium">Turma</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {atividadeAtual.turma?.nome ? formatarNomeTurma(atividadeAtual.turma.nome) : '-'}
                                </p>
                            </div>

                            {/* Campo de Experiência */}
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Target className="w-4 h-4" />
                                    <span className="font-medium">Campo de Experiência</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatarCampoExperiencia(atividadeAtual.campoExperiencia)}
                                </p>
                            </div>

                            {/* Objetivo */}
                            {atividadeAtual.objetivo && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Target className="w-4 h-4" />
                                        <span className="font-medium">Objetivo de Aprendizagem</span>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                            {atividadeAtual.objetivo.codigo}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {atividadeAtual.objetivo.descricao}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Descrição */}
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <span className="font-medium">Descrição da Atividade</span>
                                </div>
                                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                    {atividadeAtual.descricao}
                                </p>
                            </div>

                            {/* Professor */}
                            {atividadeAtual.professor && (
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">Cadastrado por</span>
                                    </div>
                                    <p className="text-gray-900">{atividadeAtual.professor.nome}</p>
                                    <p className="text-sm text-gray-500">{atividadeAtual.professor.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
