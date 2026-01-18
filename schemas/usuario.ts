import { z } from "zod";

export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  rg: z.string().min(5, "RG inválido"),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)")
    .refine((date) => date <= new Date().toISOString().split('T')[0], "Data futura não permitida"),
  telefone: z.string().min(10, "Telefone inválido"),
  telefoneComercial: z.string().optional(),
  enderecoLogradouro: z.string().min(3, "Endereço obrigatório"),
  enderecoNumero: z.string().min(1, "Número obrigatório"),
  roles: z.array(z.enum(["ADMIN", "PROFESSOR", "RESPONSAVEL", "PLATFORM_ADMIN"]))
    .min(1, "Selecione pelo menos um perfil"),
});

export const updateUsuarioSchema = usuarioSchema.partial().extend({
  isAtivo: z.boolean().optional(),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
export type UpdateUsuarioFormValues = z.infer<typeof updateUsuarioSchema>;
