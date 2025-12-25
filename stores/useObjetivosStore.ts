import { create } from 'zustand';
import { api } from '@/lib/api';
import { CAMPO_EXPERIENCIA } from './useCamposStore';

export interface Objetivo {
  id: number;
  descricao: string;
  grupoId: number;
  campoId: number;
  [key: string]: any;
}

interface ObjetivosState {
  objetivos: Objetivo[];
  objetivosPorGrupoECampo: Objetivo[];
  isLoading: boolean;
  error: string | null;

  fetchObjetivos: () => Promise<void>;
  fetchObjetivosPorGrupoIdCampoId: (grupoId: number, campoId: number) => Promise<void>;
  fetchObjetivosPorTurmaECampo: (turmaGrupo: string, campoId: number) => Promise<void>;
  getObjetivos: () => Objetivo[];
  limparCache: () => void;
}

export const useObjetivosStore = create<ObjetivosState>((set, get) => ({
  objetivos: [],
  objetivosPorGrupoECampo: [],
  isLoading: false,
  error: null,

  fetchObjetivos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/objetivos', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || errorData.details || `Erro ao listar objetivos: ${response.status}`);
      }

      const objetivos = await response.json();
      set({ objetivos, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar objetivos';
      set({ isLoading: false, error: message });
      console.error('Error fetching objetivos:', error);
    }
  },

  fetchObjetivosPorGrupoIdCampoId: async (grupoId: number, campoId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/objetivos/grupo-campo?grupoId=${grupoId}&campoId=${campoId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || errorData.details || `Erro ao listar objetivos: ${response.status}`);
      }

      const objetivos = await response.json();
      set({ objetivosPorGrupoECampo: objetivos, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar objetivos';
      set({ isLoading: false, error: message });
      console.error('Error fetching objetivos por grupo e campo:', error);
    }
  },

  fetchObjetivosPorTurmaECampo: async (turmaGrupo: string, campoId: number) => {
    set({ isLoading: true, error: null });
    try {
      if (!turmaGrupo || campoId <= 0) {
        throw new Error('Turma e campoId inválidos');
      }

      console.warn('fetchObjetivosPorTurmaECampo: use fetchObjetivosPorGrupoIdCampoId com grupoId mapeado');
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar objetivos';
      set({ isLoading: false, error: message });
      console.error('Error fetching objetivos por turma e campo:', error);
    }
  },

  getObjetivos: () => {
    const state = get();
    return state.objetivos;
  },

  limparCache: () => {
    set({ objetivos: [], objetivosPorGrupoECampo: [], error: null });
  }
}));
