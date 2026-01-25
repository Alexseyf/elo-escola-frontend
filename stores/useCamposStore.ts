import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Atividade } from '@/types/atividades';

export enum CAMPO_EXPERIENCIA {
  EU_OUTRO_NOS = "EU_OUTRO_NOS",
  CORPO_GESTOS_MOVIMENTOS = "CORPO_GESTOS_MOVIMENTOS",
  TRACOS_SONS_CORES_FORMAS = "TRACOS_SONS_CORES_FORMAS",
  ESCUTA_FALA_PENSAMENTO_IMAGINACAO = "ESCUTA_FALA_PENSAMENTO_IMAGINACAO",
  ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES = "ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES"
}

export interface CampoExperienciaResponse {
  id: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
}

export interface DetalheTurmaRelatorio {
  turmaId: number;
  turma: string;
  total: number;
}

export interface CampoExperienciaRelatorio {
  campoExperiencia: CAMPO_EXPERIENCIA;
  totalGeral: number;
  detalhesPorTurma: DetalheTurmaRelatorio[];
}

export interface ResumoRelatorio {
  totalAtividades: number;
  totalCampos: number;
}

export interface RelatorioAtividadesCampoExperiencia {
  resumo: ResumoRelatorio;
  relatorio: CampoExperienciaRelatorio[];
}

interface CamposState {
  campos: CampoExperienciaResponse[];
  relatorio: RelatorioAtividadesCampoExperiencia | null;
  relatoriosCache: Record<string, RelatorioAtividadesCampoExperiencia>;
  isLoading: boolean;
  error: string | null;

  fetchCampos: () => Promise<void>;
  fetchRelatorioAtividades: (turmaId?: number) => Promise<void>;
  getCampoById: (id: number) => CampoExperienciaResponse | undefined;
  mapearCampoParaId: (campo: CAMPO_EXPERIENCIA) => number;
  limparCache: () => void;
}

const campoExperienciaTextos: Record<CAMPO_EXPERIENCIA, string> = {
  [CAMPO_EXPERIENCIA.EU_OUTRO_NOS]: "O eu, o outro e o nós",
  [CAMPO_EXPERIENCIA.CORPO_GESTOS_MOVIMENTOS]: "Corpo, gestos e movimentos",
  [CAMPO_EXPERIENCIA.TRACOS_SONS_CORES_FORMAS]: "Traços, sons, cores e formas",
  [CAMPO_EXPERIENCIA.ESCUTA_FALA_PENSAMENTO_IMAGINACAO]: "Escuta, fala, pensamento e imaginação",
  [CAMPO_EXPERIENCIA.ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES]: "Espaços, tempos, quantidades, relações e transformações"
};

async function fetchClientSideReport(turmaId: number): Promise<RelatorioAtividadesCampoExperiencia> {
    const { useAuthStore } = await import('@/stores/useAuthStore');
    const user = useAuthStore.getState().user;

    if (!user?.id) {
        throw new Error('Usuário não autenticado');
    }

    const response = await api(`/api/v1/atividades/turma-atividades/${user.id}`, { method: 'GET' });
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar atividades do professor para fallback: ${response.status}`);
    }
    
    const data = await response.json();
    const atividades: Atividade[] = data.atividades || [];
    
    const targetTurmaId = Number(turmaId);
    const filteredAtividades = atividades.filter(a => {
        const aTurmaId = Number(a.turmaId);
        const aTurmaObjId = a.turma?.id ? Number(a.turma.id) : null;
        return aTurmaId === targetTurmaId || aTurmaObjId === targetTurmaId;
    });
    
    const counts: Record<CAMPO_EXPERIENCIA, { total: number, turmaNome: string }> = {
        [CAMPO_EXPERIENCIA.EU_OUTRO_NOS]: { total: 0, turmaNome: '' },
        [CAMPO_EXPERIENCIA.CORPO_GESTOS_MOVIMENTOS]: { total: 0, turmaNome: '' },
        [CAMPO_EXPERIENCIA.TRACOS_SONS_CORES_FORMAS]: { total: 0, turmaNome: '' },
        [CAMPO_EXPERIENCIA.ESCUTA_FALA_PENSAMENTO_IMAGINACAO]: { total: 0, turmaNome: '' },
        [CAMPO_EXPERIENCIA.ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES]: { total: 0, turmaNome: '' }
    };
    
    let turmaName = '';

    filteredAtividades.forEach(a => {
        if (a.campoExperiencia && counts[a.campoExperiencia]) {
            counts[a.campoExperiencia].total++;
        } else if (a.campoExperiencia) {
             console.warn(`[Dashboard] Unknown campo experience: ${a.campoExperiencia}`);
        }
        
        if (a.turma?.nome) {
            turmaName = a.turma.nome;
        }
    });

    if (!turmaName && data.turmas) {
        const t = data.turmas.find((t: any) => Number(t.id) === targetTurmaId);
        if (t) turmaName = t.nome;
    }
    
    const report: CampoExperienciaRelatorio[] = Object.values(CAMPO_EXPERIENCIA).map(campo => {
        const count = counts[campo].total;
        return {
            campoExperiencia: campo,
            totalGeral: count,
            detalhesPorTurma: count > 0 ? [{
                turmaId,
                turma: turmaName || 'Turma',
                total: count
            }] : []
        };
    });
    
    const totalActivities = filteredAtividades.length;
    
    return {
        resumo: {
            totalAtividades: totalActivities,
            totalCampos: Object.values(CAMPO_EXPERIENCIA).length
        },
        relatorio: report
    };
}

export const useCamposStore = create<CamposState>()(
    (set, get) => ({
      campos: [],
      relatorio: null,
      relatoriosCache: {},
      isLoading: false,
      error: null,

      fetchCampos: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api('/api/v1/campos', {
            method: 'GET',
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new Error('Não autorizado');
            }
            
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Erro ao buscar campos: ${response.status}`);
          }

          const data = await response.json();
          set({ campos: data, isLoading: false, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar campos de experiência';
          set({ isLoading: false, error: message });
          console.error('Error fetching campos:', error);
        }
      },

      fetchRelatorioAtividades: async (turmaId?: number) => {
        const state = get();
        const key = turmaId ? String(turmaId) : 'global';
        
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (turmaId) params.append('turmaId', String(turmaId));
          
          const queryString = params.toString();
          const url = `/api/v1/atividades/relatorio/campo-experiencia${queryString ? `?${queryString}` : ''}`;

          const response = await api(url, {
            method: 'GET',
          });

          if (!response.ok) {
             if ((response.status === 401 || response.status === 403) && turmaId) {
                try {
                    const fallbackData = await fetchClientSideReport(turmaId);
                    set(state => ({ 
                        relatorio: state.relatorio, 
                        relatoriosCache: { ...state.relatoriosCache, [key]: fallbackData },
                        isLoading: false, 
                        error: null 
                    }));
                    return;
                } catch (fallbackError) {
                    console.error('Fallback aggregation failed:', fallbackError);
                    throw new Error('Não autorizado - Verifique suas permissões');
                }
            }
            
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Erro ao buscar relatório: ${response.status}`);
          }

          const data = await response.json();
          set(state => ({ 
             relatorio: !turmaId ? data : state.relatorio,
             relatoriosCache: { ...state.relatoriosCache, [key]: data },
             isLoading: false, 
             error: null 
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar relatório de atividades';
          set({ isLoading: false, error: message });
          console.error('Error fetching relatorio:', error);
        }
      },

      getCampoById: (id: number) => {
        const state = get();
        return state.campos.find(c => c.id === id);
      },

      mapearCampoParaId: (campo: CAMPO_EXPERIENCIA) => {
        const state = get();
        const found = state.campos.find(c => c.campoExperiencia === campo);
        return found?.id || 0;
      },

      limparCache: () => {
        set({ campos: [], relatorio: null, relatoriosCache: {}, error: null });
      }
    })
);

export function formatarCampoExperiencia(campo: CAMPO_EXPERIENCIA): string {
  return campoExperienciaTextos[campo];
}

export function textoParaCampoExperiencia(texto: string): CAMPO_EXPERIENCIA | undefined {
  const entrada = texto.trim();
  const entries = Object.entries(campoExperienciaTextos);
  const found = entries.find(([_, value]) => value === entrada);
  return found ? found[0] as CAMPO_EXPERIENCIA : undefined;
}
