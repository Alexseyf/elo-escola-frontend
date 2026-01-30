// Types and interfaces for Activities (Atividades Pedagógicas)

import { CAMPO_EXPERIENCIA } from '@/stores/useCamposStore';

export { CAMPO_EXPERIENCIA } from '@/stores/useCamposStore';

export enum SEMESTRE {
  PRIMEIRO_SEMESTRE = "PRIMEIRO_SEMESTRE",
  SEGUNDO_SEMESTRE = "SEGUNDO_SEMESTRE"
}

export enum GRUPO_POR_CAMPO {
  BEBES = "BEBES",
  CRIANCAS_BEM_PEQUENAS = "CRIANCAS_BEM_PEQUENAS",
  CRIANCAS_PEQUENAS = "CRIANCAS_PEQUENAS",
  CRIANCAS_MAIORES = "CRIANCAS_MAIORES"
}

export interface Objetivo {
  id: number;
  codigo: string;
  descricao: string;
  campoExperiencia?: CAMPO_EXPERIENCIA;
  grupoPorCampo?: GRUPO_POR_CAMPO;
}

export interface AtividadeTurma {
  id: number;
  nome: string;
}

export interface AtividadeProfessor {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

export interface Atividade {
  id: number;
  ano: number;
  periodo: SEMESTRE;
  quantHora: number;
  descricao: string;
  data: string; // ISO Date
  campoExperiencia: CAMPO_EXPERIENCIA;
  isAtivo: boolean;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  professorId: number;
  turmaId: number;
  objetivoId: number;
  schoolId: string;
  professor?: AtividadeProfessor;
  turma?: AtividadeTurma;
  objetivo?: Objetivo;
}

export interface CreateAtividadeInput {
  ano: number;
  periodo: SEMESTRE;
  quantHora: number;
  descricao: string;
  data: string; // ISO DateTime
  turmaId: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
  objetivoId: number;
  isAtivo?: boolean;
}

export interface RelatorioDetalheTurma {
  turmaId: number;
  turma: string;
  total: number;
}

export interface RelatorioCampoExperiencia {
  campoExperiencia: CAMPO_EXPERIENCIA;
  totalGeral: number;
  detalhesPorTurma: RelatorioDetalheTurma[];
}

export interface RelatorioResponse {
  resumo: {
    totalAtividades: number;
    totalCampos: number;
  };
  relatorio: RelatorioCampoExperiencia[];
}

export interface TurmaAtividadesResponse {
  turmas: AtividadeTurma[];
  atividades: Atividade[];
}

// Label mappings
export const SEMESTRE_LABELS: Record<SEMESTRE, string> = {
  [SEMESTRE.PRIMEIRO_SEMESTRE]: "1º Semestre",
  [SEMESTRE.SEGUNDO_SEMESTRE]: "2º Semestre"
};

export const GRUPO_POR_CAMPO_LABELS: Record<GRUPO_POR_CAMPO, string> = {
  [GRUPO_POR_CAMPO.BEBES]: "Bebês (0 a 1 ano e 6 meses)",
  [GRUPO_POR_CAMPO.CRIANCAS_BEM_PEQUENAS]: "Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)",
  [GRUPO_POR_CAMPO.CRIANCAS_PEQUENAS]: "Crianças pequenas (4 anos a 5 anos e 11 meses)",
  [GRUPO_POR_CAMPO.CRIANCAS_MAIORES]: "Crianças maiores (6 anos ou mais)"
};

export interface AtividadesPaginadasResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  atividades: Atividade[];
}
