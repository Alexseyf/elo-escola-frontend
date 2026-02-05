'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAtividadesStore } from '@/stores/useAtividadesStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { CustomSelect } from '@/components/CustomSelect';
import { Search } from 'lucide-react';
import type { Atividade } from '@/types/atividades';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

export default function AtividadesList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { atividades, isLoading, error, fetchAtividades } = useAtividadesStore();
    const turmas = useTurmasStore(state => state.turmas);
    const fetchTurmas = useTurmasStore(state => state.fetchTurmas);

    const [filtroTurma, setFiltroTurma] = useState<number | string>('');
    const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');

    useEffect(() => {
        if (turmas.length === 0) {
            fetchTurmas();
        }
        fetchAtividades();
    }, [fetchTurmas, fetchAtividades, turmas.length]);

    useEffect(() => {
        const turmaId = searchParams.get('turmaId');
        if (turmaId) {
            setFiltroTurma(turmaId);
        }
    }, [searchParams]);

    const atividadesFiltradas = useMemo(() => {
        return atividades.filter((atividade: Atividade) => {
            const atividadeTurmaId = atividade.turmaId ?? atividade.turma?.id;
            const turmaMatch = !filtroTurma || String(atividadeTurmaId) === String(filtroTurma);

            const anoMatch = !filtroAno || atividade.ano === filtroAno;
            const periodoMatch = !filtroPeriodo || atividade.periodo === filtroPeriodo;

            return turmaMatch && anoMatch && periodoMatch;
        });
    }, [atividades, filtroTurma, filtroAno, filtroPeriodo]);

    const formatarData = (data: string) => {
        return data.slice(8, 10) + '/' + data.slice(5, 7) + '/' + data.slice(0, 4);
    };

    const limparFiltros = () => {
        setFiltroTurma('');
        setFiltroAno(new Date().getFullYear());
        setFiltroPeriodo('');
    };

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="p-6 space-y-6">
                <PageHeader
                    title="Atividades Pedagógicas"
                    subtitle="Gerencie as atividades cadastradas no sistema"
                />

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Turma
                            </label>
                            <CustomSelect
                                id="filtroTurma"
                                name="filtroTurma"
                                value={filtroTurma}
                                onChange={(e) => setFiltroTurma(e.target.value)}
                                options={[
                                    { value: '', label: 'Todas as turmas' },
                                    ...turmas.map(t => ({
                                        value: t.id,
                                        label: formatarNomeTurma(t.nome)
                                    }))
                                ]}
                                className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ano
                            </label>
                            <CustomSelect
                                id="filtroAno"
                                name="filtroAno"
                                value={filtroAno}
                                onChange={(e) => setFiltroAno(Number(e.target.value))}
                                options={[
                                    { value: new Date().getFullYear(), label: new Date().getFullYear().toString() },
                                    { value: new Date().getFullYear() - 1, label: (new Date().getFullYear() - 1).toString() }
                                ]}
                                className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Período
                            </label>
                            <CustomSelect
                                id="filtroPeriodo"
                                name="filtroPeriodo"
                                value={filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value)}
                                options={[
                                    { value: '', label: 'Todos os períodos' },
                                    { value: 'PRIMEIRO_SEMESTRE', label: '1º Semestre' },
                                    { value: 'SEGUNDO_SEMESTRE', label: '2º Semestre' }
                                ]}
                                className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={limparFiltros}
                                className="w-full h-[46px]"
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Carregando atividades...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchAtividades}
                            className="mt-2 text-sm underline hover:text-red-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : atividadesFiltradas.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-300 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Nenhuma atividade encontrada</h3>
                        <p className="text-gray-500 mt-2">
                            {atividades.length === 0
                                ? 'Nenhuma atividade cadastrada no sistema.'
                                : 'Nenhuma atividade corresponde aos filtros selecionados.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Campo de Experiência
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Turma
                                            </th>
                                            <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data
                                            </th>
                                            <th className="hidden md:table-cell px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Horas
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {atividadesFiltradas.map((atividade: Atividade) => (
                                            <tr key={atividade.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                                                    <span className="inline-block max-w-xs text-xs">
                                                        {formatarCampoExperiencia(atividade.campoExperiencia)}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {atividade.turma?.nome ? formatarNomeTurma(atividade.turma.nome) : '-'}
                                                </td>
                                                <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatarData(atividade.data)}
                                                </td>
                                                <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                                    {atividade.quantHora}h
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        variant="soft"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => router.push(`/admin/atividades/${atividade.id}`)}
                                                    >
                                                        Detalhar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="text-sm text-gray-600">
                            <p>
                                Exibindo <strong>{atividadesFiltradas.length}</strong> de{' '}
                                <strong>{atividades.length}</strong> atividades
                            </p>
                        </div>
                    </>
                )}
            </div>
        </RouteGuard>
    );
}
