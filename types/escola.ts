export interface CreateSchoolInput {
  name: string;
  slug: string;
  legalName?: string;
  cnpj?: string;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
  subscriptionPlan?: 'BASIC' | 'PRO' | 'PREMIUM';
  
  adminUser: {
    nome: string;
    email: string;
    telefone: string;
  };
}
