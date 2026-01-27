'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAlunosStore } from '@/stores/useAlunosStore';
import { getDiariosByAlunoId } from '@/utils/diarios';
import { Diario } from '@/types/diario';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { ArrowLeft, Calendar, FileText, ChevronRight, Moon, Clipboard } from 'lucide-react';

export default function VisualizarDiariosPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = Number(params.id);
  const { currentAluno, getAlunoDetalhes } = useAlunosStore();

  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [selectedDiario, setSelectedDiario] = useState<Diario | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDiarios = useCallback(async () => {
    setLoading(true);
    const data = await getDiariosByAlunoId(alunoId);
    setDiarios(data);
    if (data.length > 0) {
      setSelectedDiario(data[0]);
    }
    setLoading(false);
  }, [alunoId]);

  useEffect(() => {
    if (alunoId) {
      getAlunoDetalhes(alunoId);
      loadDiarios();
    }
  }, [alunoId, getAlunoDetalhes, loadDiarios]);

  useEffect(() => {
    if (currentAluno && currentAluno.turma) {
      const isTurnoInverso = currentAluno.turma.nome.toUpperCase().replace(/\s/g, '') === 'TURNOINVERSO';
      if (isTurnoInverso) {
        router.push('/professor/dashboard');
      }
    }
  }, [currentAluno, router]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/professor/diarios')}
              className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-100 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentAluno?.nome}</h1>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Histórico de Diários</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar: History List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Últimos Registros</h3>
                {loading ? (
                  <div className="py-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-bold italic">Buscando...</p>
                  </div>
                ) : diarios.length === 0 ? (
                  <div className="py-10 text-center">
                    <Clipboard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Nenhum diário encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diarios.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiario(d)}
                        className={`w-full text-left p-4 rounded-lg transition-all border ${selectedDiario?.id === d.id
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-100 hover:bg-blue-50/30'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className={`w-4 h-4 ${selectedDiario?.id === d.id ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="font-semibold text-sm">{formatDate(d.data)}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-all ${selectedDiario?.id === d.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main view: Selected Diary Details */}
            <div className="lg:col-span-8">
              {!selectedDiario ? (
                <div className="bg-white rounded-lg p-20 text-center border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-200 mb-4" />
                  <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wider">Selecione um registro</h2>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 rounded-lg text-white shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Registro Detalhado</p>
                        <h2 className="text-xl font-semibold text-gray-900">{formatDate(selectedDiario.data)}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* Alimentação */}
                    <div className="bg-blue-50/30 p-6 rounded-lg border border-blue-100">
                      <h3 className="font-semibold text-blue-800 uppercase text-[10px] tracking-wider mb-4">Refeições</h3>
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'Lanche da manhã', val: selectedDiario.lancheManha },
                          { label: 'Almoço', val: selectedDiario.almoco },
                          { label: 'Lanche da tarde', val: selectedDiario.lancheTarde },
                          { label: 'Leite', val: selectedDiario.leite }
                        ].map((m, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-blue-100/50 last:border-0">
                            <span className="text-gray-600 font-medium">{m.label}:</span>
                            <span className="font-semibold text-blue-700">
                              {m.val === 'OTIMO' ? 'Ótimo' :
                                m.val === 'BOM' ? 'Bom' :
                                  m.val === 'REGULAR' ? 'Regular' :
                                    m.val === 'NAO_ACEITOU' ? 'Não aceitou' :
                                      m.val === 'NAO_SE_APLICA' ? 'Não se aplica' : m.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Saúde */}
                    <div className="bg-emerald-50/30 p-6 rounded-lg border border-emerald-100">
                      <h3 className="font-semibold text-emerald-800 uppercase text-[10px] tracking-wider mb-4">Saúde</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-1 border-b border-emerald-100/50">
                          <span className="text-gray-600 font-medium">Evacuação:</span>
                          <span className="font-semibold text-emerald-700">
                            {selectedDiario.evacuacao === 'NORMAL' ? 'Normal' :
                              selectedDiario.evacuacao === 'LIQUIDA' ? 'Líquida' :
                                selectedDiario.evacuacao === 'DURA' ? 'Dura' :
                                  selectedDiario.evacuacao === 'NAO_EVACUOU' ? 'Não evacuou' :
                                    selectedDiario.evacuacao || 'Normal'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium">Disposição:</span>
                          <span className="font-semibold text-emerald-700">
                            {selectedDiario.disposicao === 'AGITADO' ? 'Agitado' :
                              selectedDiario.disposicao === 'NORMAL' ? 'Normal' :
                                selectedDiario.disposicao === 'CALMO' ? 'Calmo' :
                                  selectedDiario.disposicao === 'SONOLENTO' ? 'Sonolento' :
                                    selectedDiario.disposicao === 'CANSADO' ? 'Cansado' :
                                      selectedDiario.disposicao || 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sono */}
                    {selectedDiario.periodosSono?.length > 0 && (
                      <div className="bg-purple-50/30 p-6 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-purple-800 uppercase text-[10px] tracking-wider mb-4">Sono</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-1 border-b border-purple-100/50">
                            <span className="text-gray-600 font-medium">Total de períodos:</span>
                            <span className="font-semibold text-purple-700">{selectedDiario.periodosSono.length}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-purple-100/50">
                            <span className="text-gray-600 font-medium">Tempo total:</span>
                            <span className="font-semibold text-purple-700">
                              {(() => {
                                const totalMinutes = selectedDiario.periodosSono.reduce((acc, p) => {
                                  const [h, m] = (p.tempoTotal || '00:00').split(':').map(Number);
                                  return acc + h * 60 + m;
                                }, 0);
                                const h = Math.floor(totalMinutes / 60);
                                const m = totalMinutes % 60;
                                return `${h}h${m.toString().padStart(2, '0')}m`;
                              })()}
                            </span>
                          </div>
                          <div className="space-y-2 mt-4">
                            {selectedDiario.periodosSono.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 text-gray-600 font-medium bg-white/50 p-3 rounded-lg border border-purple-50">
                                <div className="flex flex-col sm:flex-row flex-1 sm:items-center justify-between gap-1">
                                  <span className="text-sm">Período {i + 1}: {p.horaDormiu} → {p.horaAcordou}</span>
                                  <span className="text-xs sm:text-sm text-purple-600 font-semibold">Tempo de sono: {p.tempoTotal}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Itens */}
                    {selectedDiario.itensProvidencia?.length > 0 && (
                      <div className="bg-amber-50/30 p-6 rounded-lg border border-amber-100">
                        <h3 className="font-semibold text-amber-800 uppercase text-[10px] tracking-wider mb-4">Itens Solicitados</h3>
                        <p className="text-gray-700 font-medium text-sm leading-relaxed">
                          {selectedDiario.itensProvidencia.map((item, idx) => {
                            const name = typeof item === 'string' ? item : item.itemProvidencia?.nome;
                            const label = name === 'FRALDA' ? 'Fralda' :
                              name === 'LENCO_UMEDECIDO' ? 'Lenços Umedecidos' :
                                name === 'POMADA' ? 'Pomada' :
                                  name === 'LEITE' ? 'Leite' :
                                    name === 'ESCOVA_DE_DENTE' ? 'Escova de Dente' :
                                      name === 'CREME_DENTAL' ? 'Creme Dental' : name;

                            if (idx === 0) return label;
                            if (idx === selectedDiario.itensProvidencia.length - 1) return ` e ${label}`;
                            return `, ${label}`;
                          })}
                        </p>
                      </div>
                    )}

                    {/* Observações */}
                    {selectedDiario.observacoes && (
                      <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider mb-3 px-1">Observações</h3>
                        <p className="text-gray-700 text-sm font-medium leading-relaxed whitespace-pre-wrap px-1 italic">
                          &quot;{selectedDiario.observacoes.trim()}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
