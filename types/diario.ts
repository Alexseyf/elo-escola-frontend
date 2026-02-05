export type TrocaFralda = 'NORMAL' | 'LIQUIDA' | 'DURA' | 'NAO_EVACUOU' | string;
export type Alimentacao = 'OTIMO' | 'BOM' | 'REGULAR' | 'NAO_ACEITOU' | 'NAO_SE_APLICA' | string;
export type SonoStatus = 'AGITADO' | 'NORMAL' | 'CALMO' | 'SONOLENTO' | 'CANSADO' | string;
export type ItemProvidencia = string | {
  id: number;
  itemProvidenciaId: number;
  itemProvidencia: {
    id: number;
    nome: string;
  };
};

export interface PeriodoSono {
  id?: string | number;
  horaDormiu: string;   // HH:mm
  horaAcordou: string;  // HH:mm
  tempoTotal: string;   // HH:mm
  sleepHour?: number;
  sleepMinute?: number;
  wakeHour?: number;
  wakeMinute?: number;
  saved?: boolean;
}

export interface Diario {
  id: number;
  data: string;
  observacoes: string;
  alunoId: number;
  disposicao?: SonoStatus;
  lancheManha?: Alimentacao;
  almoco?: Alimentacao;
  lancheTarde?: Alimentacao;
  leite?: Alimentacao;
  evacuacao?: TrocaFralda;
  periodosSono: PeriodoSono[];
  itensProvidencia: ItemProvidencia[];
  aluno?: {
    id: number;
    nome: string;
    turma?: {
      id: number;
      nome: string;
    };
  };
}

export interface CreateDiarioDTO {
  alunoId: number;
  data: string;
  evacuacao: TrocaFralda;
  lancheManha: Alimentacao;
  almoco: Alimentacao;
  lancheTarde: Alimentacao;
  leite: Alimentacao;
  disposicao: SonoStatus;
  observacoes: string;
  periodosSono: { horaDormiu: string; horaAcordou: string; tempoTotal: string }[];
  itensProvidencia: string[];
}

export interface DiarioFormData {
  alunoId?: number;
  data: string;
  trocaFralda: TrocaFralda;
  alimentacao: Alimentacao;
  sonoStatus: SonoStatus;
  observacoes: string;
  periodosSono: { id?: number; horaDormiu: string; horaAcordou: string; tempoTotal: string; saved?: boolean }[];
  itensProvidencia: string[];
  cafeDaManha?: string;
  almoco?: string;
  lancheDaTarde?: string;
  leite?: string;
}

export interface Frequencia {
  id: number;
  data: string;
  presente: boolean;
  alunoId: number;
  turmaId: number;
  aluno?: {
    id: number;
    nome: string;
  };
}

export interface FrequenciaBatchInput {
  data: string;
  turmaId: number;
  frequencias: {
    alunoId: number;
    presente: boolean;
  }[];
}
