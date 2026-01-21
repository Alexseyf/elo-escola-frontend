import { useAlunosStore } from '@/stores/useAlunosStore';
import type { 
  Aluno, 
  CreateAlunoData, 
  AlunoDetalhes, 
  VerificaDiarioResult 
} from '@/stores/useAlunosStore';

export type { 
  Aluno, 
  CreateAlunoData, 
  AlunoDetalhes, 
  VerificaDiarioResult 
} from '@/stores/useAlunosStore';

export interface PeriodoSono {
  id: number;
  diarioId: number;
  inicio: string;
  fim: string;
}

export interface ItemProvidencia {
  id: number;
  diarioId: number;
  itemProvidenciaId: number;
  itemProvidencia: {
    id: number;
    descricao: string;
  };
}

export interface Diario {
  id: number;
  alunoId: number;
  data: string;
  periodosSono: PeriodoSono[];
  itensProvidencia: ItemProvidencia[];
}

export async function getAlunos(): Promise<Aluno[]> {
  try {
    const store = useAlunosStore.getState();
    await store.fetchAlunos();
    return store.alunos;
  } catch (error) {
    console.error('Error fetching alunos:', error);
    return [];
  }
}

export interface CreateAlunoResult {
  success: boolean;
  message: string;
  data?: Aluno;
}

export const validateAlunoData = (data: CreateAlunoData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  } else if (data.nome.trim().length < 3) {
    errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    isValid = false;
  } else if (data.nome.trim().length > 60) {
    errors.nome = 'Nome deve ter no máximo 60 caracteres';
    isValid = false;
  }

  if (!data.dataNasc) {
    errors.dataNasc = 'Data de nascimento é obrigatória';
    isValid = false;
  } else {
    const dataNasc = new Date(data.dataNasc);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataNasc > hoje) {
      errors.dataNasc = 'Data de nascimento não pode ser uma data futura';
      isValid = false;
    }
  }

  if (!data.turmaId || data.turmaId <= 0) {
    errors.turmaId = 'Turma é obrigatória';
    isValid = false;
  }

  if (data.mensalidade !== undefined && data.mensalidade <= 0) {
    errors.mensalidade = 'Mensalidade deve ser um valor positivo';
    isValid = false;
  }

  return { isValid, errors };
};

export async function createAluno(data: CreateAlunoData): Promise<CreateAlunoResult> {
  try {
    const validation = validateAlunoData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Dados inválidos',
        data: undefined
      };
    }

    const store = useAlunosStore.getState();
    return await store.createAluno(data);
  } catch (error) {
    console.error('Error creating aluno:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar aluno'
    };
  }
}

export async function getAlunosByTurma(turmaId: number): Promise<Aluno[]> {
  try {
    const store = useAlunosStore.getState();
    return await store.fetchAlunosByTurma(turmaId);
  } catch (error) {
    console.error('Error fetching alunos by turma:', error);
    return [];
  }
}

export async function verificarRegistroDiarioAluno(
  alunoId: number,
  data?: string
): Promise<VerificaDiarioResult | null> {
  try {
    const store = useAlunosStore.getState();
    return await store.verificarRegistroDiarioAluno(alunoId, data);
  } catch (error) {
    console.error('Error verificando registro de diário:', error);
    return null;
  }
}

export async function getAlunoDetalhes(id: number): Promise<AlunoDetalhes | null> {
  try {
    const store = useAlunosStore.getState();
    return await store.getAlunoDetalhes(id);
  } catch (error) {
    console.error('Erro ao buscar detalhes do aluno:', error);
    return null;
  }
}

export interface AdicionarResponsavelResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function adicionarResponsavelAluno(
  alunoId: number,
  usuarioId: number
): Promise<AdicionarResponsavelResult> {
  try {
    const store = useAlunosStore.getState();
    return await store.adicionarResponsavelAluno(alunoId, usuarioId);
  } catch (error) {
    console.error('Erro ao adicionar responsável:', error);
    return {
      success: false,
      message: 'Erro ao adicionar responsável'
    };
  }
}

export async function getAlunosDoResponsavel(): Promise<Aluno[]> {
  try {
    const store = useAlunosStore.getState();
    return await store.fetchAlunosDoResponsavel();
  } catch (error) {
    console.error('Erro ao buscar meus alunos:', error);
    return [];
  }
}
