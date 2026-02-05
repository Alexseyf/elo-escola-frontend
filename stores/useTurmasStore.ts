import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { api } from '@/lib/api';

export enum TURMA {
  BERCARIO1 = 'BERCARIO1',
  BERCARIO2 = 'BERCARIO2',
  MATERNAL1 = 'MATERNAL1',
  MATERNAL2 = 'MATERNAL2',
  PRE1 = 'PRE1',
  PRE2 = 'PRE2',
  TURNOINVERSO = 'TURNOINVERSO'
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Professor {
  id: number;
  usuarioId: number;
  usuario: Usuario;
}

interface Aluno {
  id: number;
  nome: string;
}

export interface TurmaData {
  id: number;
  nome: string;
  ano: number;
  professores: Professor[];
  alunos: Aluno[];
  temDiarioClasse?: boolean;
}

export interface TurmaComTotalAlunos {
  id: number;
  nome: string;
  totalAlunosAtivos: number;
}

export interface MensalidadeAluno {
  id: number;
  nome: string;
  mensalidade: number;
}

export interface MensalidadeTurma {
  turmaId: number;
  turmaNome: string;
  quantidadeAlunos: number;
  totalMensalidade: number;
  alunos: MensalidadeAluno[];
}

export interface MensalidadesResponse {
  turmas: MensalidadeTurma[];
  totalGeral: number;
}

export interface Grupo {
  id: number;
  nome: string;
}

export interface TurmaFilters {
  page?: number;
  limit?: number;
  ano?: number;
}

export interface DiarioStatus {
  alunoId: number;
  temDiario: boolean;
  diarioId: number | null;
}

export interface TotalAlunosFilters {
  turmaId?: number;
}

interface TurmasState {
  turmas: TurmaData[];
  grupos: Grupo[];
  turmasComTotal: TurmaComTotalAlunos[];
  mensalidadesPorTurma: MensalidadesResponse | null;
  
  pagination: {
    total: number;
    page: number;
    limit: number;
  } | null;
  
  isLoading: boolean;
  error: string | null;

  fetchTurmas: (filters?: TurmaFilters) => Promise<void>;
  fetchTurmaById: (id: number) => Promise<TurmaData | null>;
  fetchGrupos: () => Promise<void>;
  fetchTotalAlunosPorTurma: (filters?: TotalAlunosFilters) => Promise<void>;
  fetchTotalAlunosPorTurmaById: (id: number) => Promise<TurmaComTotalAlunos | null>;
  fetchMensalidadesPorTurma: () => Promise<void>;
  getTurmaById: (id: number) => TurmaData | undefined;
  getGrupoById: (id: number) => Grupo | undefined;
  mapearTurmaParaGrupo: (nomeTurma: string) => string;
  mapearGrupoParaId: (nomeGrupo: string) => number;
  cadastrarTurma: (nome: TURMA) => Promise<boolean>;
  updateTurma: (id: number, data: Partial<TurmaData>) => Promise<boolean>;
  vincularProfessor: (turmaId: number, usuarioId: number) => Promise<{ success: boolean; message: string }>;
  desvincularProfessor: (turmaId: number, usuarioId: number) => Promise<{ success: boolean; message: string }>;
  limparCache: () => void;
  checkDiariesStatus: (turmaId: number, date?: string) => Promise<DiarioStatus[]>;
}

const mapeamentoTurmaGrupo: Record<string, string> = {
  'BERCARIO1': 'BEBES',
  'BERCARIO2': 'BEBES',
  'MATERNAL1': 'CRIANCAS_BEM_PEQUENAS',
  'MATERNAL2': 'CRIANCAS_BEM_PEQUENAS',
  'PRE1': 'CRIANCAS_PEQUENAS',
  'PRE2': 'CRIANCAS_PEQUENAS',
  'TURNOINVERSO': 'CRIANCAS_MAIORES'
};

const mapeamentoNomeTurma: Record<string, string> = {
  'BERCARIO1': 'Berçário 1',
  'BERCARIO2': 'Berçário 2',
  'MATERNAL1': 'Maternal 1',
  'MATERNAL2': 'Maternal 2',
  'PRE1': 'Pré 1',
  'PRE2': 'Pré 2',
  'TURNOINVERSO': 'Turno Inverso'
};

export const useTurmasStore = create<TurmasState>()(
  (set, get) => ({
    turmas: [],
    grupos: [],
    turmasComTotal: [],
    mensalidadesPorTurma: null,
    pagination: null,
    isLoading: false,
    error: null,

    fetchTurmas: async (filters?: TurmaFilters) => {
      set({ isLoading: true, error: null });
      try {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.ano) params.append('ano', String(filters.ano));
        
        const queryString = params.toString();
        const url = `/api/v1/turmas${queryString ? `?${queryString}` : ''}`;
        
        const response = await api(url, {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar turmas: ${response.status}`);
        }

        const data = await response.json();
        const turmasFormatadas = data.map((turma: TurmaData) => ({
          ...turma,
          nome: formatarNomeTurma(turma.nome)
        }));

        set({ turmas: turmasFormatadas, isLoading: false, error: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar turmas';
        set({ isLoading: false, error: message });
        console.error('Error fetching turmas:', error);
      }
    },

    fetchTurmaById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api(`/api/v1/turmas/${id}`, {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar turma: ${response.status}`);
        }

        const turma = await response.json();
        turma.nome = formatarNomeTurma(turma.nome);

        set({ isLoading: false, error: null });
        return turma;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar turma';
        set({ isLoading: false, error: message });
        console.error('Error fetching turma:', error);
        return null;
      }
    },

    fetchGrupos: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api('/api/v1/grupos', {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar grupos: ${response.status}`);
        }

        const grupos = await response.json();
        set({ grupos, isLoading: false, error: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar grupos';
        set({ isLoading: false, error: message });
        console.error('Error fetching grupos:', error);
      }
    },

    fetchTotalAlunosPorTurma: async (filters?: TotalAlunosFilters) => {
      set({ isLoading: true, error: null });
      try {
        const params = new URLSearchParams();
        if (filters?.turmaId) params.append('turmaId', String(filters.turmaId));
        
        const queryString = params.toString();
        const url = `/api/v1/turmas/totalAlunosTurma${queryString ? `?${queryString}` : ''}`;
        
        const response = await api(url, {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar total de alunos: ${response.status}`);
        }

        const turmasComTotal = await response.json();
        const turmasFormatadas = turmasComTotal.map((turma: TurmaComTotalAlunos) => ({
          ...turma,
          nome: formatarNomeTurma(turma.nome)
        }));

        set({ turmasComTotal: turmasFormatadas, isLoading: false, error: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar total de alunos por turma';
        set({ isLoading: false, error: message });
        console.error('Error fetching total alunos:', error);
      }
    },

    fetchTotalAlunosPorTurmaById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api(`/api/v1/turmas/totalAlunosTurma?turmaId=${id}`, {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar total de alunos da turma: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const turma = data[0];
          turma.nome = formatarNomeTurma(turma.nome);
          set({ isLoading: false, error: null });
          return turma as TurmaComTotalAlunos;
        }

        set({ isLoading: false, error: null });
        return null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar total de alunos da turma';
        set({ isLoading: false, error: message });
        console.error('Error fetching total alunos by id:', error);
        return null;
      }
    },

    fetchMensalidadesPorTurma: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api('/api/v1/alunos/relatorios/mensalidades-por-turma', {
          method: 'GET'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar mensalidades: ${response.status}`);
        }

        const data: MensalidadesResponse = await response.json();

        const turmasFormatadas = data.turmas.map(turma => ({
          ...turma,
          turmaNome: formatarNomeTurma(turma.turmaNome)
        }));

        set({ 
          mensalidadesPorTurma: {
            ...data,
            turmas: turmasFormatadas
          }, 
          isLoading: false, 
          error: null 
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao buscar mensalidades por turma.';
        set({ isLoading: false, error: message });
        console.error('Error fetching mensalidades:', error);
      }
    },

    getTurmaById: (id: number) => {
      const state = get();
      return state.turmas.find(t => t.id === id);
    },

    getGrupoById: (id: number) => {
      const state = get();
      return state.grupos.find(g => g.id === id);
    },

    mapearTurmaParaGrupo: (nomeTurma: string) => {
      // Normaliza para remover acentos, espaços e converter para maiúsculo
      const turmaKey = nomeTurma
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, '');
      return mapeamentoTurmaGrupo[turmaKey] || '';
    },

    mapearGrupoParaId: (nomeGrupo: string) => {
      const state = get();
      const grupo = state.grupos.find(g => g.nome.toUpperCase() === nomeGrupo.toUpperCase());
      return grupo?.id || 0;
    },

    cadastrarTurma: async (nome: TURMA) => {
      set({ isLoading: true, error: null });
      try {
        const authState = useAuthStore.getState();
        const token = authState.token;
        if (!token) {
          throw new Error('Usuário não autenticado ou sessão expirada.');
        }

        if (!Object.values(TURMA).includes(nome)) {
          throw new Error(`Nome de turma inválido: ${nome}`);
        }

        const response = await api('/api/v1/turmas', {
          method: 'POST',
          body: JSON.stringify({ nome })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erro ao cadastrar turma: ${response.status}`);
        }

        await get().fetchTurmas();
        set({ isLoading: false, error: null });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao cadastrar turma';
        set({ isLoading: false, error: message });
        console.error('Error cadastrando turma:', error);
        return false;
      }
    },

    updateTurma: async (id: number, data: Partial<TurmaData>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api(`/api/v1/turmas/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Erro ao atualizar turma: ${response.status}`);
            }

            const updatedTurma = await response.json();
            updatedTurma.nome = formatarNomeTurma(updatedTurma.nome);

            set(state => ({
                turmas: state.turmas.map(t => t.id === id ? { ...t, ...updatedTurma } : t),
                isLoading: false,
                error: null
            }));
            
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar turma';
            set({ isLoading: false, error: message });
            console.error('Error updateTurma:', error);
            return false;
        }
    },

    vincularProfessor: async (turmaId: number, usuarioId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api(`/api/v1/turmas/${turmaId}/professor`, {
          method: 'POST',
          body: JSON.stringify({ usuarioId })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message = errorData?.message || errorData?.erro || 'Erro ao vincular professor';
          set({ isLoading: false });
          return { success: false, message };
        }

        set({ isLoading: false });
        return { success: true, message: 'Professor vinculado com sucesso' };
      } catch (error) {
        set({ isLoading: false, error: 'Erro ao vincular professor' });
        console.error('Error linking professor:', error);
        return { success: false, message: 'Erro ao vincular professor' };
      }
    },

    desvincularProfessor: async (turmaId: number, usuarioId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api(`/api/v1/turmas/${turmaId}/professor/${usuarioId}`, {
          method: 'DELETE'
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = data.message || data.erro || 'Erro ao desvincular professor';
          set({ isLoading: false });
          return { success: false, message };
        }

        set({ isLoading: false });
        return { success: true, message: data.message || 'Professor desvinculado com sucesso' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao desvincular professor';
        set({ isLoading: false, error: message });
        console.error('Error unlinking professor:', error);
        return { success: false, message };
      }
    },

    limparCache: () => {
      set({ turmas: [], grupos: [], turmasComTotal: [], mensalidadesPorTurma: null, pagination: null, error: null });
    },

    checkDiariesStatus: async (turmaId: number, date?: string) => {
      try {
        const params = new URLSearchParams();
        if (date) params.append('date', date);

        const response = await api(`/api/v1/turmas/${turmaId}/diarios/status?${params.toString()}`, {
          method: 'GET'
        });

        if (!response.ok) return [];

        return await response.json() as DiarioStatus[];
      } catch (error) {
        console.error('Error checking diaries status:', error);
        return [];
      }
    }
  })
);

export function formatarNomeTurma(nomeTurma: string): string {
  if (!nomeTurma) return '';
  
  const turmaUpperCase = nomeTurma.toUpperCase();
  return mapeamentoNomeTurma[turmaUpperCase] || nomeTurma;
}

export function converterNomeParaEnum(nomeFormatado: string): TURMA | null {
  const mapeamentoInverso: Record<string, TURMA> = {
    'Berçário 1': TURMA.BERCARIO1,
    'Berçário 2': TURMA.BERCARIO2,
    'Maternal 1': TURMA.MATERNAL1,
    'Maternal 2': TURMA.MATERNAL2,
    'Pré 1': TURMA.PRE1,
    'Pré 2': TURMA.PRE2,
    'Turno Inverso': TURMA.TURNOINVERSO
  };

  return mapeamentoInverso[nomeFormatado] || 
         (Object.values(TURMA).includes(nomeFormatado.toUpperCase() as TURMA) ? 
          nomeFormatado.toUpperCase() as TURMA : null);
}
