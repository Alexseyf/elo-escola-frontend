export interface Turma {
  id: number
  nome: string
}

export interface Aluno {
  id: number
  nome: string
  dataNasc: string
  isAtivo: boolean
  mensalidade: number
  turmaId: number
  turma: Turma
}

export interface AlunoDetalhado extends Aluno {
  // Campos adicionais futuros
}
