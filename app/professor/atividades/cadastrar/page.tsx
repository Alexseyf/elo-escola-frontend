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

import { PageHeader } from '@/components/PageHeader';

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
  const { campos, fetchCampos, mapearCampoParaId } = useCamposStore();
  const grupos = useTurmasStore(state => state.grupos);

  const [mensagem, setMensagem] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null);
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear().toString(),
    periodo: SEMESTRE.PRIMEIRO_SEMESTRE,
    quantHora: '1',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    turmaId: '',
    campoExperiencia: CAMPO_EXPERIENCIA.EU_OUTRO_NOS,
    objetivoId: '',
    isAtivo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const profTurmas = useMemo(() =>
    turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
    [turmas, user?.id]
  );

  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      if (turmas.length === 0) {
        await fetchTurmas();
      }
      await Promise.all([fetchGrupos(), fetchCampos()]);
    };

    loadInitialData();
  }, [user, fetchTurmas, fetchGrupos, fetchCampos, turmas.length]);

  // Set initial turmaId when turmas are loaded
  useEffect(() => {
    if (profTurmas.length > 0 && !formData.turmaId) {
      setFormData(prev => ({ ...prev, turmaId: profTurmas[0].id.toString() }));
    }
  }, [profTurmas, formData.turmaId]);

  useEffect(() => {
    async function loadObjetivos() {
      if (!formData.turmaId || !formData.campoExperiencia || campos.length === 0 || grupos.length === 0) {
        return;
      }

      try {
        const turma = turmas.find(t => t.id === Number(formData.turmaId));
        if (!turma) return;

        const grupo = mapearTurmaParaGrupo(turma.nome);
        if (!grupo) {
          console.error('Não foi possível mapear turma para grupo:', turma.nome);
          return;
        }

        const grupoId = mapearGrupoParaId(grupo);
        if (!grupoId) {
          console.error('Não foi possível obter ID do grupo:', grupo);
          return;
        }

        const campoId = mapearCampoParaId(formData.campoExperiencia as CAMPO_EXPERIENCIA);
        if (!campoId) {
          console.error('Não foi possível obter ID do campo:', formData.campoExperiencia);
          return;
        }

        await fetchObjetivosPorGrupoIdCampoId(grupoId, campoId);

        setFormData(prev => ({ ...prev, objetivoId: '' }));
      } catch (error) {
        console.error('Erro ao carregar objetivos:', error);
      }
    }

    loadObjetivos();
  }, [formData.turmaId, formData.campoExperiencia, turmas, campos, grupos, fetchObjetivosPorGrupoIdCampoId, mapearCampoParaId, mapearGrupoParaId, mapearTurmaParaGrupo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'turmaId' || name === 'campoExperiencia') {
      setFormData(prev => ({ ...prev, objetivoId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao cadastrar atividade';
      setMensagem({
        texto: errorMsg,
        tipo: 'erro'
      });
    }
  };

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cadastrar Nova Atividade"
          subtitle="Preencha os campos abaixo para cadastrar uma nova atividade pedagógica"
          backHref={() => router.back()}
        />
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Message */}
          {mensagem && (
            <div className={`p-4 rounded-lg border ${mensagem.tipo === 'sucesso'
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
                      { value: SEMESTRE.PRIMEIRO_SEMESTRE, label: '1º Semestre' },
                      { value: SEMESTRE.SEGUNDO_SEMESTRE, label: '2º Semestre' }
                    ]}
                    error={!!errors.periodo}
                  />
                  {errors.periodo && <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>}
                </div>

                {/* Quantidade de Horas */}
                <div>
                  <label htmlFor="quantHora" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Horas*
                  </label>
                  <CustomSelect
                    id="quantHora"
                    name="quantHora"
                    value={formData.quantHora}
                    onChange={handleInputChange}
                    options={[
                      { value: '1', label: '1 hora' },
                      { value: '2', label: '2 horas' },
                      { value: '3', label: '3 horas' },
                      { value: '4', label: '4 horas' }
                    ]}
                    error={!!errors.quantHora}
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${errors.data ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
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
                    options={profTurmas.map(turma => ({
                      value: turma.id,
                      label: formatarNomeTurma(turma.nome)
                    }))}
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
                    options={Object.values(CAMPO_EXPERIENCIA).map(campo => ({
                      value: campo,
                      label: formatarCampoExperiencia(campo)
                    }))}
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
                      ...objetivosPorGrupoECampo.map((objetivo: { id: number; codigo: string; descricao: string }) => ({
                        value: objetivo.id,
                        label: `${objetivo.codigo} - ${objetivo.descricao}`
                      }))
                    ]}
                    error={!!errors.objetivoId}
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${errors.descricao ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
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
