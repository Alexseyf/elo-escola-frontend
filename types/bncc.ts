// Types for BNCC Management (Campos and Objetivos)

import { CAMPO_EXPERIENCIA } from './atividades';

export { CAMPO_EXPERIENCIA, GRUPO_POR_CAMPO } from './atividades';

// Campo de Experiência
export interface CampoExperiencia {
  id: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
}

export interface CreateCampoInput {
  campoExperiencia: CAMPO_EXPERIENCIA;
}

export interface UpdateCampoInput {
  campoExperiencia: CAMPO_EXPERIENCIA;
}

// Grupo por Campo
export interface GrupoPorCampo {
  id: number;
  grupoPorCampo: string;
  totalObjetivos?: number;
}

// Objetivo de Aprendizagem
export interface Objetivo {
  id: number;
  codigo: string;
  descricao: string;
  grupoId: number;
  campoExperienciaId: number;
  isAtivo: boolean;
  grupo?: GrupoPorCampo;
  campoExperiencia?: CampoExperiencia;
}

export interface CreateObjetivoInput {
  codigo: string;
  descricao: string;
  grupoId: number;
  campoExperienciaId: number;
}

export interface UpdateObjetivoInput {
  codigo?: string;
  descricao?: string;
  grupoId?: number;
  campoExperienciaId?: number;
  isAtivo?: boolean;
}

// API Response types
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export interface DeleteCampoError {
  erro: string;
  objetivosCount?: number;
}
