import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  dataNasc: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida")
    .refine((date) => date <= new Date().toISOString().split('T')[0], "Data futura não permitida"),
  turmaId: z.coerce.number().min(1, "Selecione uma turma"),
  mensalidade: z.coerce.number().optional(),
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;
