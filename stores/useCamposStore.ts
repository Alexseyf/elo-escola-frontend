import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

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
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCampos: () => Promise<void>;
  fetchRelatorioAtividades: () => Promise<void>;
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

export const useCamposStore = create<CamposState>()(
    (set, get) => ({
      campos: [],
      relatorio: null,
      isLoading: false,
      error: null,

      fetchCampos: async () => {
        set({ isLoading: true, error: null });
        try {
          const authState = useAuthStore.getState();
          const token = authState.token;
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campos`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
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

      fetchRelatorioAtividades: async () => {
        const state = get();
        // Se já tem dados, não mostra loading (stale-while-revalidate)
        if (!state.relatorio) {
          set({ isLoading: true, error: null });
        } else {
            // Se quiser limpar erro anterior mas manter dados
            set({ error: null });
        }

        try {
          const authState = useAuthStore.getState();
          const token = authState.token;
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividades/relatorio/campo-experiencia`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new Error('Não autorizado');
            }
            
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Erro ao buscar relatório: ${response.status}`);
          }

          const data = await response.json();
          // Simples comparação profunda poderia evitar re-renders desnecessários, 
          // mas por enquanto apenas atualizamos
          set({ relatorio: data, isLoading: false, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar relatório de atividades';
          // Mantém dados antigos em caso de erro, mas avisa o usuário via erro
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
        set({ campos: [], relatorio: null, error: null });
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
