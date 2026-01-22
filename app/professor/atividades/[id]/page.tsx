'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAtividadesStore } from '@/stores/useAtividadesStore';
import { formatarNomeTurma } from '@/stores/useTurmasStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { SEMESTRE_LABELS } from '@/types/atividades';
import { ArrowLeft } from 'lucide-react';

export default function AtividadeDetalhesPage() {
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
      <RouteGuard allowedRoles={['PROFESSOR']}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </RouteGuard>
    );
  }

  if (error || !atividadeAtual) {
    return (
      <RouteGuard allowedRoles={['PROFESSOR']}>
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 px-6 py-4 rounded-lg">
              <p className="text-gray-900">{error || 'Atividade não encontrada'}</p>
              <button
                onClick={() => router.back()}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">Detalhes da Atividade</h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {/* Basic Info */}
            <div className="p-6 space-y-3">
              <p className="text-gray-900">
                <span className="text-gray-500">Ano:</span> {atividadeAtual.ano}
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Período:</span> {SEMESTRE_LABELS[atividadeAtual.periodo]}
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Data:</span> {formatarData(atividadeAtual.data)}
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Carga horária:</span> {atividadeAtual.quantHora}h
              </p>
            </div>

            {/* Class and Field */}
            <div className="p-6 space-y-3">
              <p className="text-gray-900">
                <span className="text-gray-500">Turma:</span>{' '}
                {atividadeAtual.turma?.nome ? formatarNomeTurma(atividadeAtual.turma.nome) : '-'}
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Campo de experiência:</span>{' '}
                {formatarCampoExperiencia(atividadeAtual.campoExperiencia)}
              </p>
            </div>

            {/* Objective */}
            {atividadeAtual.objetivo && (
              <div className="p-6">
                <p className="text-gray-500 mb-2">Objetivo de aprendizagem</p>
                <p className="text-sm text-gray-700 mb-1">{atividadeAtual.objetivo.codigo}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {atividadeAtual.objetivo.descricao}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="p-6">
              <p className="text-gray-500 mb-2">Descrição</p>
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {atividadeAtual.descricao}
              </p>
            </div>

            {/* Professor */}
            {atividadeAtual.professor && (
              <div className="p-6">
                <p className="text-gray-500 mb-2">Cadastrado por</p>
                <p className="text-gray-900">{atividadeAtual.professor.nome}</p>
                <p className="text-sm text-gray-600">{atividadeAtual.professor.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
