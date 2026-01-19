export enum TipoEvento {
  REUNIAO = "REUNIAO",
  FERIADO = "FERIADO",
  RECESSO = "RECESSO",
  EVENTO_ESCOLAR = "EVENTO_ESCOLAR",
  ATIVIDADE_PEDAGOGICA = "ATIVIDADE_PEDAGOGICA",
  OUTRO = "OUTRO"
}

export interface Cronograma {
  id: number;
  titulo: string;
  descricao: string;
  data: string; // ISO Date (Início)
  dataFim?: string | null; // ISO Date (Fim)
  pularFinaisDeSemana: boolean;
  tipoEvento: TipoEvento;
  isAtivo: boolean;
  criadorId: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  criador?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateCronogramaDTO {
  titulo: string;
  descricao: string;
  data: string;
  dataFim?: string | null;
  pularFinaisDeSemana: boolean;
  tipoEvento: TipoEvento;
  isAtivo?: boolean;
}
