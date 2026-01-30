import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Atividade, CreateAtividadeInput, TurmaAtividadesResponse, AtividadesPaginadasResponse } from '@/types/atividades';

interface AtividadesState {
  atividades: Atividade[];
  atividadeAtual: Atividade | null;
  isLoading: boolean;
  error: string | null;

  fetchAtividades: () => Promise<void>;
  fetchAtividadeById: (id: number) => Promise<void>;
  fetchUltimaAtividadePorTurma: (turmaId: number) => Promise<Atividade | null>;
  fetchAtividadesPaginadasPorTurma: (turmaId: number, page: number, limit: number) => Promise<AtividadesPaginadasResponse | null>;
  fetchProfessorAtividades: (professorId: number) => Promise<TurmaAtividadesResponse | null>;
  createAtividade: (data: CreateAtividadeInput) => Promise<Atividade | null>;
  limparCache: () => void;
}

export const useAtividadesStore = create<AtividadesState>()((set) => ({
  atividades: [],
  atividadeAtual: null,
  isLoading: false,
  error: null,

  fetchAtividades: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/atividades', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades: ${response.status}`);
      }

      const data = await response.json();
      set({ atividades: data.atividades || data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar atividades';
      set({ isLoading: false, error: message });
      console.error('Error fetching atividades:', error);
    }
  },

  fetchAtividadeById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/atividades/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividade: ${response.status}`);
      }

      const data = await response.json();
      set({ atividadeAtual: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar atividade';
      set({ isLoading: false, error: message });
      console.error('Error fetching atividade:', error);
    }
  },
  
  fetchUltimaAtividadePorTurma: async (turmaId: number) => {
    try {
      const response = await api(`/api/v1/atividades/last-by-turma/${turmaId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Erro ao buscar última atividade: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching last atividade for turma:', error);
      return null;
    }
  },

  fetchAtividadesPaginadasPorTurma: async (turmaId: number, page: number = 1, limit: number = 5) => {
    try {
      const response = await api(`/api/v1/atividades/turma/${turmaId}?page=${page}&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching paginated atividades for turma:', error);
      return null;
    }
  },

  fetchProfessorAtividades: async (professorId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/atividades/turma-atividades/${professorId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades do professor: ${response.status}`);
      }

      const data: TurmaAtividadesResponse = await response.json();
      set({ atividades: data.atividades, isLoading: false });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar atividades do professor';
      set({ isLoading: false, error: message });
      console.error('Error fetching professor atividades:', error);
      return null;
    }
  },

  createAtividade: async (data: CreateAtividadeInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/atividades', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.erro || `Erro ao criar atividade: ${response.status}`);
      }

      const result = await response.json();
      const novaAtividade = result.atividade || result;
      
      set(state => ({ 
        atividades: [novaAtividade, ...state.atividades],
        isLoading: false 
      }));
      
      return novaAtividade;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar atividade';
      set({ isLoading: false, error: message });
      console.error('Error creating atividade:', error);
      return null;
    }
  },

  limparCache: () => {
    set({ atividades: [], atividadeAtual: null, error: null });
  }
}));
