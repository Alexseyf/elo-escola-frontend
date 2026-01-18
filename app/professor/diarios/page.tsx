'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { verificarRegistroDiarioAluno } from '@/utils/alunos';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Search, User, ChevronRight, CheckCircle2, History } from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';
import { useMemo } from 'react';

export default function ProfessorDiariosPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const turmas = useTurmasStore(state => state.turmas);
  const fetchTurmas = useTurmasStore(state => state.fetchTurmas);
  const loadingTurmas = useTurmasStore(state => state.isLoading);
  
  const [filter, setFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState<number | null>(null);
  const [diariosStatus, setDiariosStatus] = useState<Record<number, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (turmas.length === 0) {
      fetchTurmas();
    }
  }, [fetchTurmas, turmas.length]);

  const profTurmas = useMemo(() => 
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  useEffect(() => {
    if (profTurmas.length > 0 && turmaFilter === null) {
      setTurmaFilter(profTurmas[0].id);
    }
  }, [profTurmas.length, turmaFilter]);

  useEffect(() => {
    const checkStatus = async () => {
      if (turmas.length > 0) {
        setLoadingStatus(true);
        const allAlunos = turmas.flatMap(t => t.alunos || []);
        const uniqueAlunos = Array.from(new Set(allAlunos.map(a => a.id)))
          .map(id => allAlunos.find(a => a.id === id)!);

        const statusMap: Record<number, boolean> = {};
        
        await Promise.all(uniqueAlunos.map(async (aluno) => {
          const res = await verificarRegistroDiarioAluno(aluno.id);
          statusMap[aluno.id] = res?.temDiario || false;
        }));

        setDiariosStatus(statusMap);
        setLoadingStatus(false);
      }
    };

    checkStatus();
  }, [turmas]);

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
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Diários</h1>
              <p className="text-gray-500 mt-1">Gerencie os registros diários</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome do aluno..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
            <CustomSelect
              id="turma-select"
              name="turmaId"
              value={turmaFilter || ''}
              onChange={(e) => setTurmaFilter(Number(e.target.value))}
              options={profTurmas.map(t => ({ 
                value: t.id, 
                label: t.nome 
              }))}
              className="h-full rounded-2xl border-gray-100 shadow-sm font-medium text-gray-700 px-5 py-4"
            />
          </div>

          {/* List */}
          {loadingTurmas ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium italic">Carregando turmas...</p>
            </div>
          ) : filteredTurmas.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <User className="text-gray-300 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Nenhum aluno encontrado</h3>
              <p className="text-gray-500 mt-2">Tente ajustar seus filtros de busca.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredTurmas.map(turma => (
                <div key={turma.id} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <span className="w-2 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest">{formatarNomeTurma(turma.nome)}</h2>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-blue-100">
                      {turma.alunos.length} {turma.alunos.length === 1 ? 'ALUNO' : 'ALUNOS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadingStatus ? (
                      [1, 2, 3].map((n) => (
                        <div key={n} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-[88px]" />
                      ))
                    ) : (
                      turma.alunos.map(aluno => {
                        const temDiario = diariosStatus[aluno.id];
                        return (
                          <Link 
                            href={temDiario ? `/professor/diarios/visualizar/${aluno.id}` : `/professor/diarios/novo/${aluno.id}`}
                            key={aluno.id}
                            className={`group relative overflow-hidden bg-white p-6 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 ${
                              temDiario ? 'border-green-100 bg-green-50/10' : 'border-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate flex-1">
                                {aluno.nome.split(' ').slice(0, 2).join(' ')}
                              </h4>
                              
                              {temDiario ? (
                                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Preenchido
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0">
                                  Pendente
                                </span>
                              )}
                            </div>
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
