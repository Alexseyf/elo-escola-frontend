'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAtividadesStore } from '@/stores/useAtividadesStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { CustomSelect } from '@/components/CustomSelect';
import { Search, Plus } from 'lucide-react';
import { SEMESTRE_LABELS } from '@/types/atividades';
import type { Atividade, AtividadeTurma } from '@/types/atividades';

export default function ProfessorAtividadesPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { atividades, isLoading, error, fetchProfessorAtividades } = useAtividadesStore();
  const turmas = useTurmasStore(state => state.turmas);
  const fetchTurmas = useTurmasStore(state => state.fetchTurmas);

  const [filtroTurma, setFiltroTurma] = useState<number | string>('');
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');
  const [turmasData, setTurmasData] = useState<AtividadeTurma[]>([]);

  const profTurmas = useMemo(() =>
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  useEffect(() => {
    if (turmas.length === 0) {
      fetchTurmas();
    }
  }, [fetchTurmas, turmas.length]);

  const turmasDisponiveis = turmasData.length > 0 ? turmasData : profTurmas;

  useEffect(() => {
    if (user?.id) {
      fetchProfessorAtividades(user.id).then(data => {
        if (data) {
          setTurmasData(data.turmas);
        }
      });
    }
  }, [user?.id, fetchProfessorAtividades]);

  useEffect(() => {
    if (turmasDisponiveis.length > 0 && !filtroTurma) {
      setFiltroTurma(turmasDisponiveis[0].id);
    }
  }, [turmasDisponiveis, filtroTurma]);

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
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Minhas Atividades</h1>
              <p className="text-gray-500 mt-1">Visualize e gerencie suas atividades pedagógicas</p>
            </div>
            <button
              onClick={() => router.push('/professor/atividades/cadastrar')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nova Atividade
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
                  options={turmasDisponiveis.map(t => ({
                    value: t.id,
                    label: formatarNomeTurma(t.nome)
                  }))}
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
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={limparFiltros}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
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
                onClick={() => user?.id && fetchProfessorAtividades(user.id)}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : atividadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma atividade encontrada</h3>
              <p className="text-gray-500 mt-2">
                {atividades.length === 0
                  ? 'Você ainda não cadastrou nenhuma atividade.'
                  : 'Nenhuma atividade corresponde aos filtros selecionados.'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
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
                            <button
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-blue-100"
                              onClick={() => router.push(`/professor/atividades/${atividade.id}`)}
                            >
                              Detalhar
                            </button>
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
      </div>
    </RouteGuard>
  );
}
