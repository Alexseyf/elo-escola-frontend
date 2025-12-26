import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(255),
  slug: z.string()
    .min(3, 'Slug muito curto')
    .max(50, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  legalName: z.string().max(255).optional(),
  cnpj: z.string()
    .transform(v => v?.replace(/\D/g, '') || undefined)
    .pipe(z.string().length(14, 'CNPJ deve ter 14 dígitos').optional()),
  logoUrl: z.string()
    .transform(v => v === '' ? undefined : v)
    .pipe(z.string().url('URL inválida').optional()),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional().or(z.literal('')),
  timezone: z.string().default('America/Sao_Paulo'),
  subscriptionPlan: z.enum(['BASIC', 'PRO', 'PREMIUM']).default('BASIC'),
  
  adminUser: z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    telefone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(20, 'Telefone muitoongo'),
  })
});

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;
