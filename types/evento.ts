import { TipoEvento } from "./cronograma"; // Reuse enum if possible, or redefine

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: string; // ISO Date "YYYY-MM-DD"
  horaInicio: string; // "HH:MM"
  horaFim: string; // "HH:MM"
  tipoEvento: TipoEvento;
  isAtivo: boolean;
  turmaId: number;
  criadorId: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  turma?: {
    id: number;
    nome: string;
  };
  criador?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateEventoDTO {
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoEvento: TipoEvento;
  turmaId: number;
  isAtivo?: boolean;
}

export type UpdateEventoDTO = Partial<CreateEventoDTO>;
