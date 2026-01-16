import { z } from "zod";

export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  senha: z.string().optional(),
  roles: z.array(z.enum(["ADMIN", "PROFESSOR", "ALUNO", "RESPONSAVEL", "PLATFORM_ADMIN"])).min(1, "Selecione pelo menos um perfil"),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
