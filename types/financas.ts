export type TipoPagamento = 
  | 'SALARIO' 
  | 'EXTRA' 
  | 'VALE_TRANSPORTE' 
  | 'ALUGUEL' 
  | 'AGUA' 
  | 'LUZ' 
  | 'INTERNET' 
  | 'MANUTENCAO_REFORMA' 
  | 'OUTRO';

export interface Pagamento {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  tipo: TipoPagamento;
  turmaId: number | null;
  turma?: {
    id: number;
    nome: string;
  };
  createdAt: string;
}

export interface TurmaBalanco {
  turmaId: number;
  nome: string;
  quantidadeAlunos: number;
  receita: number;
  despesaDireta: number;
  rateioGeral: number;
  saldo: number;
  detalhesDespesas: Pagamento[];
}

export interface BalancoMensal {
  mes: number;
  ano: number;
  totalReceitas: number;
  totalDespesasTurmas: number;
  totalDespesasGeral: number;
  turmas: TurmaBalanco[];
  pagamentosGerais: Pagamento[];
  tipo?: 'SNAPSHOT'; // Se presente, indica que o mês está fechado
}

export interface CreatePagamentoDTO {
  descricao: string;
  valor: number;
  data: string;
  tipo: TipoPagamento;
  turmaId?: number | null;
}
