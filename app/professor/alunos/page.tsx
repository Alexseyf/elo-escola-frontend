'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { CustomSelect } from '@/components/CustomSelect';
import { ChevronRight, Search, User, GraduationCap } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProfessorAlunosPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const isMobile = useIsMobile();
  const turmas = useTurmasStore(state => state.turmas);
  const fetchTurmas = useTurmasStore(state => state.fetchTurmas);
  const loadingTurmas = useTurmasStore(state => state.isLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);

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
    if (profTurmas.length > 0 && selectedTurmaId === null) {
      setSelectedTurmaId(profTurmas[0].id);
    }
  }, [profTurmas.length, selectedTurmaId]);

  const filteredAlunos = useMemo(() => {
    const selectedTurma = profTurmas.find(t => t.id === selectedTurmaId);
    if (!selectedTurma) return [];

    const alunos = selectedTurma.alunos || [];

    if (!searchTerm) return alunos;

    return alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [profTurmas, selectedTurmaId, searchTerm]);

  const selectedTurma = profTurmas.find(t => t.id === selectedTurmaId);

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Alunos</h1>
            <p className="text-gray-500 mt-1">Visualize os alunos das suas turmas</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {profTurmas.length > 1 && (
              <CustomSelect
                id="turma-select"
                name="turmaId"
                value={selectedTurmaId || ''}
                onChange={(e) => setSelectedTurmaId(Number(e.target.value))}
                options={profTurmas.map(t => ({
                  value: t.id,
                  label: formatarNomeTurma(t.nome)
                }))}
                className="h-full rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
              />
            )}
          </div>

          {/* Content */}
          {loadingTurmas ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium">Carregando turmas...</p>
            </div>
          ) : profTurmas.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-gray-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma turma atribuída</h3>
              <p className="text-gray-500 mt-2">Você ainda não foi atribuído a nenhuma turma.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Turma Header */}
              {selectedTurma && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatarNomeTurma(selectedTurma.nome)}
                    </h2>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100">
                    {filteredAlunos.length} {filteredAlunos.length === 1 ? 'aluno' : 'alunos'}
                  </span>
                </div>
              )}

              {/* Students Grid */}
              {filteredAlunos.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-gray-300 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Nenhum aluno encontrado</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm
                      ? 'Tente ajustar sua busca.'
                      : 'Esta turma ainda não possui alunos cadastrados.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAlunos.map(aluno => (
                    <div
                      key={aluno.id}
                      className={`bg-white p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md hover:border-blue-200 relative ${!isMobile ? 'cursor-pointer' : ''}`}
                      onClick={() => !isMobile && router.push(`/professor/alunos/${aluno.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {aluno.nome}
                          </h4>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {formatarNomeTurma(selectedTurma?.nome || '')}
                          </p>
                        </div>
                      </div>

                      <button
                        className="md:hidden absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-400 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/professor/alunos/${aluno.id}`);
                        }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
