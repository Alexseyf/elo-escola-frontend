import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  turma?: {
    id: number;
    nome: string;
  };
}

export interface CreateAlunoData {
  nome: string;
  dataNasc: string;
  turmaId: number;
  mensalidade?: number;
}

export interface AlunoDetalhes {
  id: number;
  nome: string;
  dataNasc: string;
  turmaId: number;
  isAtivo: boolean;
  mensalidade: number;
  turma: {
    id: number;
    nome: string;
    turno: string;
  };
  responsaveis: Array<{
    id: number;
    alunoId: number;
    usuarioId: number;
    usuario: {
      id: number;
      nome: string;
      email: string;
    };
  }>;
  diario: any[];
}

export interface VerificaDiarioResult {
  alunoId: number;
  data: string;
  temDiario: boolean;
  diario: { id: number } | null;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AlunoFilters extends PaginationParams {
  turmaId?: number;
  isAtivo?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AlunosState {
  alunos: Aluno[];
  alunosPorTurma: Record<number, Aluno[]>;
  currentAluno: AlunoDetalhes | null;
  
  // Pagination metadata
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  
  isLoading: boolean;
  error: string | null;

  fetchAlunos: (filters?: AlunoFilters) => Promise<void>;
  fetchAlunosByTurma: (turmaId: number) => Promise<Aluno[]>;
  createAluno: (data: CreateAlunoData) => Promise<{ success: boolean; message: string; data?: Aluno }>;
  getAlunoDetalhes: (id: number) => Promise<AlunoDetalhes | null>;
  verificarRegistroDiarioAluno: (alunoId: number, data?: string) => Promise<VerificaDiarioResult | null>;
  adicionarResponsavelAluno: (alunoId: number, usuarioId: number) => Promise<{ success: boolean; message: string }>;
  removerResponsavelAluno: (alunoId: number, usuarioId: number) => Promise<{ success: boolean; message: string }>;
  updateAluno: (id: number, data: Partial<CreateAlunoData>) => Promise<{ success: boolean; message: string }>;
  limparCache: () => void;
}

export const useAlunosStore = create<AlunosState>((set, get) => ({
  alunos: [],
  alunosPorTurma: {},
  currentAluno: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchAlunos: async (filters?: AlunoFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.turmaId) params.append('turmaId', String(filters.turmaId));
      if (filters?.isAtivo !== undefined) params.append('isAtivo', String(filters.isAtivo));

      const queryString = params.toString();
      const url = `/api/v1/alunos${queryString ? `?${queryString}` : ''}`;

      const response = await api(url);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            set({ isLoading: false });
            return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data && result.pagination) {
        const paginated = result as PaginatedResponse<Aluno>;
        set({ 
          alunos: paginated.data, 
          pagination: paginated.pagination,
          isLoading: false, 
          error: null 
        });
      } else {
        const data = Array.isArray(result) ? result : [];
        set({ 
          alunos: data, 
          pagination: {
            total: data.length,
            page: 1,
            limit: data.length,
            totalPages: 1
          },
          isLoading: false, 
          error: null 
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching alunos';
      set({ isLoading: false, error: message });
      console.error('Error fetching alunos:', error);
    }
  },

  fetchAlunosByTurma: async (turmaId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/turmas/${turmaId}/alunos`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Unauthorized access');
          set({ isLoading: false });
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set((state) => ({
        alunosPorTurma: { ...state.alunosPorTurma, [turmaId]: data },
        isLoading: false,
        error: null
      }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching alunos by turma';
      set({ isLoading: false, error: message });
      console.error('Error fetching alunos by turma:', error);
      return [];
    }
  },

  createAluno: async (data: CreateAlunoData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/alunos', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            set({ isLoading: false });
            return { success: false, message: 'Não autorizado' };
        }
        
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `Erro ao cadastrar aluno: ${response.status}`;
        set({ isLoading: false, error: message });
        return { success: false, message };
      }

      const responseData = await response.json();
      set({ isLoading: false, error: null });
      return { success: true, message: 'Aluno cadastrado com sucesso', data: responseData };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar aluno';
      set({ isLoading: false, error: message });
      console.error('Error creating aluno:', error);
      return { success: false, message: 'Erro ao cadastrar aluno' };
    }
  },

  getAlunoDetalhes: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/alunos/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
         set({ isLoading: false });
         if (response.status === 404) console.error('Aluno não encontrado');
         return null;
      }

      const data = await response.json();
      set({ currentAluno: data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar detalhes do aluno';
      set({ isLoading: false, error: message });
      console.error('Erro ao buscar detalhes do aluno:', error);
      return null;
    }
  },

  verificarRegistroDiarioAluno: async (alunoId: number, data?: string) => {
    try {
      const params = new URLSearchParams();
      if (data) params.append('data', data);
      
      const response = await api(`/api/v1/alunos/${alunoId}/possui-registro-diario?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) return null;

      const responseData = await response.json();
      return responseData as VerificaDiarioResult;
    } catch (error) {
      console.error('Error verificando registro de diário:', error);
      return null;
    }
  },

  adicionarResponsavelAluno: async (alunoId: number, usuarioId: number) => {
    set({ isLoading: true, error: null });
    try {
        const response = await api(`/api/v1/alunos/${usuarioId}/responsavel`, {
            method: 'POST',
            body: JSON.stringify({ alunoId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            set({ isLoading: false });
            return { 
                success: false, 
                message: errorData?.erro || 'Erro ao adicionar responsável' 
            };
        }

        const data = await response.json();
        set({ isLoading: false });
        return { success: true, message: 'Responsável adicionado com sucesso', data };
    } catch (error) {
        set({ isLoading: false, error: 'Erro ao adicionar responsável' });
        return { success: false, message: 'Erro ao adicionar responsável' };
    }
  },

  removerResponsavelAluno: async (alunoId: number, usuarioId: number) => {
    set({ isLoading: true, error: null });
    try {
        const response = await api(`/api/v1/alunos/${alunoId}/responsavel/${usuarioId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            set({ isLoading: false });
            return { success: false, message: 'Erro ao remover responsável' };
        }

        set({ isLoading: false });
        return { success: true, message: 'Responsável removido com sucesso' };
    } catch (error) {
        set({ isLoading: false, error: 'Erro ao remover responsável' });
        return { success: false, message: 'Erro ao remover responsável' };
    }
  },

  updateAluno: async (id: number, data: Partial<CreateAlunoData>) => {
    set({ isLoading: true, error: null });
    try {
        const response = await api(`/api/v1/alunos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            set({ isLoading: false });
            return { success: false, message: 'Erro ao atualizar aluno' };
        }

        set({ isLoading: false });
        return { success: true, message: 'Aluno atualizado com sucesso' };
    } catch (error) {
        set({ isLoading: false, error: 'Erro ao atualizar aluno' });
        return { success: false, message: 'Erro ao atualizar aluno' };
    }
  },

  limparCache: () => {
    set({ alunos: [], alunosPorTurma: {}, currentAluno: null, pagination: null, error: null });
  }
}));
