import { useTurmasStore, TURMA, formatarNomeTurma, converterNomeParaEnum } from '@/stores/useTurmasStore';
import type { TurmaData } from '@/stores/useTurmasStore';

export { TURMA, formatarNomeTurma, converterNomeParaEnum } from '@/stores/useTurmasStore';
export type { TurmaData as Turma } from '@/stores/useTurmasStore';

export interface DadosTurma {
  nome: TURMA;
}

export interface TurmaComTotalAlunos {
  id: number;
  nome: string;
  totalAlunosAtivos: number;
}



export async function getTurmas(): Promise<{id: number; nome: string}[]> {
  try {
    const store = useTurmasStore.getState();
    await store.fetchTurmas();
    
    return store.turmas.map(turma => ({
      id: turma.id,
      nome: turma.nome
    }));
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return [];
  }
}

export async function fetchTurmas(): Promise<{ 
  success: boolean; 
  data?: any[];
  error?: string; 
}> {
  try {
    const store = useTurmasStore.getState();
    await store.fetchTurmas();
    
    return {
      success: true,
      data: store.turmas
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao buscar turmas';
    return {
      success: false,
      error: message
    };
  }
}

export async function fetchTurmaById(id: number): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const store = useTurmasStore.getState();
    const turma = await store.fetchTurmaById(id);
    
    if (!turma) {
      return {
        success: false,
        error: 'Turma não encontrada'
      };
    }
    
    return {
      success: true,
      data: turma
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao buscar turma';
    return {
      success: false,
      error: message
    };
  }
}

export function mapearTurmaParaGrupo(nomeTurma: string): string {
  const store = useTurmasStore.getState();
  return store.mapearTurmaParaGrupo(nomeTurma);
}

export async function getGrupos(): Promise<Array<{id: number; nome: string}>> {
  try {
    const store = useTurmasStore.getState();
    
    if (store.grupos.length === 0) {
      await store.fetchGrupos();
    }
    
    return store.grupos;
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

export async function mapearGrupoParaId(nomeGrupo: string): Promise<number> {
  try {
    const store = useTurmasStore.getState();
    
    if (store.grupos.length === 0) {
      await store.fetchGrupos();
    }
    
    return store.mapearGrupoParaId(nomeGrupo);
  } catch (error) {
    console.error('Erro ao mapear grupo para ID:', error);
    return 0;
  }
}

export function limparCachesGrupos(): void {
  const store = useTurmasStore.getState();
  store.limparCache();
}

export function formatarTurmas(turmas: any[]): any[] {
  if (!turmas || !Array.isArray(turmas)) return [];
  
  return turmas.map(turma => ({
    ...turma,
    nome: formatarNomeTurma(turma.nome)
  }));
}

export async function fetchTotalAlunosPorTurma(): Promise<{
  success: boolean;
  data?: TurmaComTotalAlunos[];
  error?: string;
}> {
  try {
    const store = useTurmasStore.getState();
    await store.fetchTotalAlunosPorTurma();
    
    return {
      success: true,
      data: store.turmasComTotal
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao buscar total de alunos por turma';
    return {
      success: false,
      error: message
    };
  }
}

export interface CreateTurmaResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function cadastrarTurma(dadosTurma: DadosTurma): Promise<CreateTurmaResult> {
  try {
    if (!dadosTurma.nome) {
      return {
        success: false,
        message: 'Nome da turma é obrigatório'
      };
    }

    if (!Object.values(TURMA).includes(dadosTurma.nome)) {
      return {
        success: false,
        message: 'Nome da turma deve ser um valor válido: ' + Object.values(TURMA).join(', ')
      };
    }

    const store = useTurmasStore.getState();
    const result = await store.cadastrarTurma(dadosTurma.nome);
    
    if (result) {
      return {
        success: true,
        message: 'Turma cadastrada com sucesso'
      };
    } else {
      return {
        success: false,
        message: store.error || 'Erro ao cadastrar turma'
      };
    }
  } catch (error) {
    console.error('Erro ao cadastrar turma:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar turma'
    };
  }
}

export async function cadastrarTurmaComNomeFormatado(nomeFormatado: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const enumTurma = converterNomeParaEnum(nomeFormatado);
  
  if (!enumTurma) {
    return {
      success: false,
      error: `Nome de turma inválido: ${nomeFormatado}. Valores válidos: ${Object.values(TURMA).map(formatarNomeTurma).join(', ')}`
    };
  }

  const result = await cadastrarTurma({ nome: enumTurma });
  return {
    success: result.success,
    error: result.success ? undefined : result.message
  };
}


