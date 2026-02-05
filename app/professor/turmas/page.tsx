'use client';

import { useState, useEffect, useMemo } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { BookOpen, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function ProfessorTurmasPage() {
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
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Minhas Turmas"
          subtitle="Visualize as suas turmas"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profTurmas.map(turma => (
              <div
                key={turma.id}
                className="bg-white p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md hover:border-blue-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {formatarNomeTurma(turma.nome)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>
                        {turma.alunos?.length || 0} {turma.alunos?.length === 1 ? 'aluno' : 'alunos'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
