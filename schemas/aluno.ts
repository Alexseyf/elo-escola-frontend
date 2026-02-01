import { z } from "zod";

export const responsibleSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  rg: z.string().min(5, "RG inválido"),
  dataNascimento: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  telefone: z.string().min(10, "Telefone inválido"),
  telefoneComercial: z.string().optional(),
  enderecoLogradouro: z.string().min(5, "Endereço inválido"),
  enderecoNumero: z.string().min(1, "Número inválido"),
});

export const baseAlunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  dataNasc: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida")
    .refine((date) => date <= new Date().toISOString().split('T')[0], "Data futura não permitida"),
  turmaId: z.coerce.number().min(1, "Selecione uma turma"),
  mensalidade: z.coerce.number().min(0, "A mensalidade não pode ser negativa"),
});

export const alunoSchema = baseAlunoSchema;

export const unifiedRegistrationSchema = z.object({
  aluno: baseAlunoSchema,
  responsaveis: z.array(responsibleSchema).min(1, "Adicione pelo menos um responsável"),
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;
export type UnifiedRegistrationValues = z.infer<typeof unifiedRegistrationSchema>;

export const updateAlunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
  dataNasc: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional(),
  turmaId: z.coerce.number().min(1, "Selecione uma turma").optional(),
  mensalidade: z.coerce.number().optional(),
  isAtivo: z.boolean().optional(),
});

export type UpdateAlunoFormValues = z.infer<typeof updateAlunoSchema>;
