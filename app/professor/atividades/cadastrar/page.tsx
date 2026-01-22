'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAtividadesStore } from '@/stores/useAtividadesStore';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import { useObjetivosStore } from '@/stores/useObjetivosStore';
import { formatarCampoExperiencia, CAMPO_EXPERIENCIA, useCamposStore } from '@/stores/useCamposStore';
import { CustomSelect } from '@/components/CustomSelect';
import { SEMESTRE, type CreateAtividadeInput } from '@/types/atividades';
import { ArrowLeft } from 'lucide-react';

export default function CadastrarAtividadePage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createAtividade, isLoading } = useAtividadesStore();
  const turmas = useTurmasStore(state => state.turmas);
  const fetchTurmas = useTurmasStore(state => state.fetchTurmas);
  const fetchGrupos = useTurmasStore(state => state.fetchGrupos);
  const mapearTurmaParaGrupo = useTurmasStore(state => state.mapearTurmaParaGrupo);
  const mapearGrupoParaId = useTurmasStore(state => state.mapearGrupoParaId);
  const { objetivos, objetivosPorGrupoECampo, fetchObjetivosPorGrupoIdCampoId } = useObjetivosStore();
  const { fetchCampos, mapearCampoParaId } = useCamposStore();
  
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear().toString(),
    periodo: '',
    quantHora: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    turmaId: '',
    campoExperiencia: '',
    objetivoId: '',
    isAtivo: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter turmas to only show professor's classes
  const profTurmas = useMemo(() => 
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  useEffect(() => {
    if (turmas.length === 0) {
      fetchTurmas();
    }
    fetchGrupos();
    fetchCampos();
  }, [fetchTurmas, fetchGrupos, fetchCampos, turmas.length]);

  // Load objetivos when turma and campo are selected
  useEffect(() => {
    async function loadObjetivos() {
      if (!formData.turmaId || !formData.campoExperiencia) {
        return;
      }

      try {
        // Find selected turma
        const turma = turmas.find(t => t.id === Number(formData.turmaId));
        if (!turma) return;

        // Map turma to grupo
        const grupo = mapearTurmaParaGrupo(turma.nome);
        if (!grupo) {
          console.error('Não foi possível mapear turma para grupo:', turma.nome);
          return;
        }

        // Get grupo ID
        const grupoId = await mapearGrupoParaId(grupo);
        if (!grupoId) {
          console.error('Não foi possível obter ID do grupo:', grupo);
          return;
        }

        // Get campo ID
        const campoId = mapearCampoParaId(formData.campoExperiencia as CAMPO_EXPERIENCIA);
        if (!campoId) {
          console.error('Não foi possível obter ID do campo:', formData.campoExperiencia);
          return;
        }

        // Fetch objetivos
        console.log(`Carregando objetivos para grupoId=${grupoId}, campoId=${campoId}`);
        await fetchObjetivosPorGrupoIdCampoId(grupoId, campoId);
        
        // Reset objetivo selection
        setFormData(prev => ({ ...prev, objetivoId: '' }));
      } catch (error) {
        console.error('Erro ao carregar objetivos:', error);
      }
    }

    loadObjetivos();
  }, [formData.turmaId, formData.campoExperiencia, turmas, fetchObjetivosPorGrupoIdCampoId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset objetivo when turma or campo changes
    if (name === 'turmaId' || name === 'campoExperiencia') {
      setFormData(prev => ({ ...prev, objetivoId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ano || Number(formData.ano) < 1900) {
      newErrors.ano = 'Ano inválido';
    }
    if (!formData.periodo) {
      newErrors.periodo = 'Selecione um período';
    }
    if (!formData.quantHora || Number(formData.quantHora) < 1) {
      newErrors.quantHora = 'Quantidade de horas inválida';
    }
    if (!formData.descricao || formData.descricao.trim().length < 10) {
      newErrors.descricao = 'Descrição deve ter no mínimo 10 caracteres';
    }
    if (!formData.data) {
      newErrors.data = 'Selecione uma data';
    }
    if (!formData.turmaId) {
      newErrors.turmaId = 'Selecione uma turma';
    }
    if (!formData.campoExperiencia) {
      newErrors.campoExperiencia = 'Selecione um campo de experiência';
    }
    if (!formData.objetivoId) {
      newErrors.objetivoId = 'Selecione um objetivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const atividadeData: CreateAtividadeInput = {
        ano: Number(formData.ano),
        periodo: formData.periodo as SEMESTRE,
        quantHora: Number(formData.quantHora),
        descricao: formData.descricao.trim(),
        data: formData.data + 'T00:00:00.000Z',
        turmaId: Number(formData.turmaId),
        campoExperiencia: formData.campoExperiencia as CAMPO_EXPERIENCIA,
        objetivoId: Number(formData.objetivoId),
        isAtivo: formData.isAtivo
      };

      const result = await createAtividade(atividadeData);
      
      if (result) {
        setMensagem({
          texto: 'Atividade cadastrada com sucesso!',
          tipo: 'sucesso'
        });
        
        setTimeout(() => {
          router.push('/professor/atividades');
        }, 1500);
      } else {
        setMensagem({
          texto: 'Erro ao cadastrar atividade',
          tipo: 'erro'
        });
      }
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar atividade',
        tipo: 'erro'
      });
    }
  };

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Cadastrar Nova Atividade</h1>
            <p className="text-gray-500 mt-1">Preencha os campos abaixo para cadastrar uma nova atividade pedagógica</p>
          </div>

          {/* Message */}
          {mensagem && (
            <div className={`p-4 rounded-lg border ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <p>{mensagem.texto}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Ano */}
                <div>
                  <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-2">
                    Ano*
                  </label>
                  <input
                    type="number"
                    id="ano"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    min="1900"
                    max="2100"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.ano ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="2026"
                  />
                  {errors.ano && <p className="mt-1 text-sm text-red-600">{errors.ano}</p>}
                </div>

                {/* Período */}
                <div>
                  <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-2">
                    Período*
                  </label>
                  <CustomSelect
                    id="periodo"
                    name="periodo"
                    value={formData.periodo}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Selecione um período' },
                      { value: SEMESTRE.PRIMEIRO_SEMESTRE, label: '1º Semestre' },
                      { value: SEMESTRE.SEGUNDO_SEMESTRE, label: '2º Semestre' }
                    ]}
                    className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                    error={!!errors.periodo}
                  />
                  {errors.periodo && <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>}
                </div>

                {/* Quantidade de Horas */}
                <div>
                  <label htmlFor="quantHora" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Horas*
                  </label>
                  <input
                    type="number"
                    id="quantHora"
                    name="quantHora"
                    value={formData.quantHora}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.quantHora ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Horas"
                  />
                  {errors.quantHora && <p className="mt-1 text-sm text-red-600">{errors.quantHora}</p>}
                </div>

                {/* Data */}
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                    Data*
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.data ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {errors.data && <p className="mt-1 text-sm text-red-600">{errors.data}</p>}
                </div>

                {/* Turma */}
                <div>
                  <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Turma*
                  </label>
                  <CustomSelect
                    id="turmaId"
                    name="turmaId"
                    value={formData.turmaId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Selecione uma turma' },
                      ...profTurmas.map(turma => ({
                        value: turma.id,
                        label: formatarNomeTurma(turma.nome)
                      }))
                    ]}
                    className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                    error={!!errors.turmaId}
                  />
                  {errors.turmaId && <p className="mt-1 text-sm text-red-600">{errors.turmaId}</p>}
                </div>

                {/* Campo de Experiência */}
                <div>
                  <label htmlFor="campoExperiencia" className="block text-sm font-medium text-gray-700 mb-2">
                    Campo de Experiência*
                  </label>
                  <CustomSelect
                    id="campoExperiencia"
                    name="campoExperiencia"
                    value={formData.campoExperiencia}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Selecione um campo' },
                      ...Object.values(CAMPO_EXPERIENCIA).map(campo => ({
                        value: campo,
                        label: formatarCampoExperiencia(campo)
                      }))
                    ]}
                    className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                    error={!!errors.campoExperiencia}
                  />
                  {errors.campoExperiencia && <p className="mt-1 text-sm text-red-600">{errors.campoExperiencia}</p>}
                </div>

                {/* Objetivo */}
                <div className="md:col-span-2">
                  <label htmlFor="objetivoId" className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo*
                  </label>
                  <CustomSelect
                    id="objetivoId"
                    name="objetivoId"
                    value={formData.objetivoId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Selecione um objetivo' },
                      ...objetivosPorGrupoECampo.map((objetivo: any) => ({
                        value: objetivo.id,
                        label: `${objetivo.codigo} - ${objetivo.descricao}`
                      }))
                    ]}
                    className="rounded-lg border-gray-200 shadow-sm text-gray-700 px-4 py-3"
                    error={!!errors.objetivoId}
                    searchable={true}
                  />
                  {errors.objetivoId && <p className="mt-1 text-sm text-red-600">{errors.objetivoId}</p>}
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição*
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.descricao ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Descreva a atividade pedagógica (máximo 500 caracteres)"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.descricao.length}/500 caracteres
                  </p>
                  {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Cadastrando...</span>
                    </div>
                  ) : (
                    'Cadastrar Atividade'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
