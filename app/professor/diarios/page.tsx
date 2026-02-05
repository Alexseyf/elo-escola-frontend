'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';

import { RouteGuard } from '@/components/auth/RouteGuard';
import { Search, User, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';
import { PageHeader } from '@/components/PageHeader';
import { StandardCard } from '@/components/StandardCard';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function ProfessorDiariosPage() {
  const user = useAuthStore(state => state.user);
  const turmas = useTurmasStore(state => state.turmas);
  const fetchTurmas = useTurmasStore(state => state.fetchTurmas);
  const loadingTurmas = useTurmasStore(state => state.isLoading);

  const [filter, setFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState<number | null>(null);
  const [diariosStatus, setDiariosStatus] = useState<Record<number, { temDiario: boolean; diarioId?: number }>>({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (turmas.length === 0) {
      fetchTurmas();
    }
  }, [fetchTurmas, turmas.length]);

  const profTurmas = useMemo(() =>
    turmas.filter(t =>
      t.professores?.some(p => p.usuarioId === user?.id) &&
      t.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
    ),
    [turmas, user?.id]
  );

  useEffect(() => {
    if (profTurmas.length > 0 && turmaFilter === null) {
      setTurmaFilter(profTurmas[0].id);
    }
  }, [profTurmas, turmaFilter]);

  useEffect(() => {
    const checkStatus = async () => {
      if (profTurmas.length > 0) {
        setLoadingStatus(true);
        const checkTurmas = turmaFilter ? profTurmas.filter(t => t.id === Number(turmaFilter)) : profTurmas;

        const statusMap: Record<number, { temDiario: boolean; diarioId?: number }> = {};

        await Promise.all(checkTurmas.map(async (turma) => {
          const today = new Date();
          const localDate = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

          const statuses = await useTurmasStore.getState().checkDiariesStatus(turma.id, localDate);
          statuses.forEach(s => {
            statusMap[s.alunoId] = {
              temDiario: s.temDiario,
              diarioId: s.diarioId || undefined
            };
          });
        }));

        setDiariosStatus(prev => ({ ...prev, ...statusMap }));
        setLoadingStatus(false);
      }
    };

    checkStatus();
  }, [profTurmas, turmaFilter]);

  const filteredTurmas = profTurmas
    .filter(t => turmaFilter === null || t.id === Number(turmaFilter))
    .map(t => ({
      ...t,
      alunos: (t.alunos || []).filter(a =>
        a.nome.toLowerCase().includes(filter.toLowerCase())
      )
    }))
    .filter(t => t.alunos.length > 0);

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Diário dos Alunos"
          subtitle="Acompanhamento da rotina diária"
          backHref="/professor/dashboard"
        />

        <div className="max-w-6xl mx-auto space-y-6">

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-white"
              />
            </div>

            {profTurmas.length > 1 && (
              <CustomSelect
                id="turma-select"
                name="turmaId"
                value={turmaFilter || ''}
                onChange={(e) => setTurmaFilter(Number(e.target.value))}
                options={profTurmas.map(t => ({
                  value: t.id,
                  label: t.nome
                }))}
                className="h-full rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
              />
            )}
          </div>

          {/* List */}
          {loadingTurmas ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium italic">Carregando turmas...</p>
            </div>
          ) : filteredTurmas.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-gray-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhum aluno encontrado</h3>
              <p className="text-gray-500 mt-2">Tente ajustar seus filtros de busca.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredTurmas.map(turma => (
                <div key={turma.id} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {turma.nome.substring(0, 1).toUpperCase()}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">{formatarNomeTurma(turma.nome)}</h2>
                    </div>
                    <span className="bg-white text-gray-500 px-3 py-1 rounded-full text-xs font-semibold border border-gray-100 shadow-sm">
                      {turma.alunos.length} {turma.alunos.length === 1 ? 'ALUNO' : 'ALUNOS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadingStatus ? (
                      [1, 2, 3].map((n) => (
                        <div key={n} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse h-[72px]" />
                      ))
                    ) : (
                      turma.alunos.map(aluno => {
                        const status = diariosStatus[aluno.id];
                        const temDiario = status?.temDiario;
                        const diarioId = status?.diarioId;

                        return (
                          <Link
                            href={temDiario && diarioId ? `/professor/diarios/editar/${diarioId}` : `/professor/diarios/novo/${aluno.id}`}
                            key={aluno.id}
                            className="block no-underline"
                          >
                            <StandardCard
                              hoverable
                              className={cn(
                                "p-4 transition-all",
                                temDiario ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 bg-white'
                              )}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <h4 className="font-medium text-gray-900 truncate flex-1">
                                  {aluno.nome.split(' ').slice(0, 2).join(' ')}
                                </h4>

                                {temDiario ? (
                                  <span className="flex items-center gap-1.5 bg-soft-green text-soft-green-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-soft-green-border shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Preenchido
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 bg-gray-50 text-gray-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-gray-100 shrink-0">
                                    Pendente
                                  </span>
                                )}
                              </div>
                            </StandardCard>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
