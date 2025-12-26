# Elo Escola 🎓

Plataforma SaaS multi-tenant de gestão escolar focada em educação infantil. Sistema moderno que permite múltiplas escolas (tenants) operarem de forma isolada na mesma infraestrutura.

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura Multi-Tenant](#arquitetura-multi-tenant)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roles e Permissões](#roles-e-permissões)
- [Padronização de Commits](#padronização-de-commits)
- [Contribuindo](#contribuindo)

## Visão Geral

O **Elo Escola** é uma plataforma SaaS de gestão educacional que oferece diferentes interfaces e funcionalidades para quatro tipos de usuários:

- **PLATFORM_ADMIN**: Gestão global da plataforma e cadastro de escolas (tenants)
- **ADMIN**: Gestão completa de uma escola específica (tenant)
- **PROFESSOR**: Gerenciamento de turmas e avaliações
- **RESPONSÁVEL**: Acompanhamento do desempenho escolar dos filhos

## Arquitetura Multi-Tenant

O sistema implementa multi-tenancy através de **Discriminator Column (Shared Database)**, onde todas as escolas compartilham o mesmo banco de dados, mas cada registro é isolado por `schoolId`.

### Fluxo de Autenticação

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│  API /login  │────▶│  JWT + Role  │
└──────────────┘     └──────────────┘     └──────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  schoolSlug no   │
                     │  response (ADMIN)│
                     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  useTenantStore  │
                     │  x-tenant-id     │
                     └──────────────────┘
```

### Stores de Estado

| Store | Responsabilidade |
|-------|------------------|
| `useAuthStore` | Autenticação, token JWT, dados do usuário |
| `useTenantStore` | Slug do tenant atual para requisições API |
| `useAlunosStore` | Cache de alunos do tenant |
| `useTurmasStore` | Cache de turmas do tenant |
| `useUsuariosStore` | Cache de usuários do tenant |
| `useCamposStore` | Campos de avaliação pedagógica |
| `useObjetivosStore` | Objetivos de aprendizagem |

### Headers de API

Todas as requisições autenticadas incluem:
- `Authorization: Bearer <token>`
- `x-tenant-id: <schoolSlug>` (para ADMIN/PROFESSOR/RESPONSAVEL)

## Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de UI com hooks
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Utilitários CSS
- **Zustand 5** - Gerenciamento de estado com persist

### UI & UX
- **Radix UI** - Componentes acessíveis
- **Shadcn/UI** - Sistema de componentes
- **Lucide React** - Ícones SVG
- **Sonner** - Notificações toast
- **Recharts** - Gráficos e visualizações

### Validação
- **Zod** - Schemas de validação
- **React Hook Form** - Gerenciamento de formulários

## Requisitos

- **Node.js**: v18+ (recomendado v20+)
- **npm** ou **yarn**: Gerenciador de pacotes
- **Git**: Para versionamento
- **API Backend**: Rodando em `http://localhost:3000`

## Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Alexseyf/elo-escola-frontend.git
cd elo-escola-frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```
A aplicação será acessada em `http://localhost:3001`

### Build para Produção
```bash
npm run build
npm start
```

### Lint do Código
```bash
npm run lint
```

## Estrutura do Projeto

```
elo-web/
├── app/                          # Next.js App Router
│   ├── admin/                    # Rotas do ADMIN (tenant)
│   │   ├── dashboard/            # Dashboard com gráficos
│   │   ├── usuarios/             # Gestão de usuários
│   │   └── graficos/             # Relatórios visuais
│   ├── platform/                 # Rotas do PLATFORM_ADMIN
│   │   └── escolas/              # Gestão de escolas/tenants
│   ├── professor/                # Rotas do PROFESSOR
│   ├── responsavel/              # Rotas do RESPONSÁVEL
│   ├── login/                    # Autenticação
│   ├── layout.tsx                # Layout raiz com Sidebar
│   └── page.tsx                  # Roteamento por role
│
├── components/
│   ├── auth/
│   │   └── RouteGuard.tsx        # Proteção de rotas por role
│   ├── platform/
│   │   └── escolas/              # Componentes de gestão de escolas
│   │       ├── school-form-sheet.tsx
│   │       └── schools-table.tsx
│   ├── ui/                       # Componentes Shadcn/UI
│   └── Sidebar.tsx               # Navegação lateral
│
├── stores/                       # Zustand stores
│   ├── useAuthStore.ts           # Autenticação + logout
│   ├── useTenantStore.ts         # Slug do tenant atual
│   ├── useAlunosStore.ts
│   ├── useTurmasStore.ts
│   ├── useUsuariosStore.ts
│   ├── useCamposStore.ts
│   └── useObjetivosStore.ts
│
├── schemas/                      # Zod validation schemas
│   └── escola.ts                 # Schema de criação de escola
│
├── types/                        # TypeScript types
│   └── escola.ts                 # Interface CreateSchoolInput
│
├── utils/                        # Funções utilitárias
│   ├── sidebarItems.ts           # Itens de menu por role
│   ├── escolas.ts                # API de escolas
│   ├── usuarios.ts               # API de usuários
│   ├── alunos.ts                 # API de alunos
│   ├── turmas.ts                 # API de turmas
│   └── auth.ts                   # Helpers de autenticação
│
├── hooks/                        # React hooks
│   ├── useTenant.ts              # Hook de tenant
│   ├── useMobile.ts              # Detecção mobile
│   └── useApiErrorHandler.ts     # Tratamento de erros 401
│
├── lib/
│   ├── api.ts                    # Cliente HTTP com headers
│   └── utils.ts                  # Utilitários gerais (cn)
│
├── middleware.ts                 # Next.js middleware
├── config.ts                     # Configuração da aplicação
└── package.json
```

## Roles e Permissões

| Role | Escopo | Rotas | Funcionalidades |
|------|--------|-------|-----------------|
| `PLATFORM_ADMIN` | Global | `/platform/*` | Criar/listar escolas, ver todos os tenants |
| `ADMIN` | Tenant | `/admin/*` | Gestão completa da escola |
| `PROFESSOR` | Tenant | `/professor/*` | Turmas, atividades, diários |
| `RESPONSAVEL` | Tenant | `/responsavel/*` | Acompanhamento dos filhos |

### Criação de Escola (PLATFORM_ADMIN)

O cadastro de uma nova escola cria automaticamente:
1. O registro da escola com configurações (nome, slug, CNPJ, etc.)
2. O usuário administrador inicial com role `ADMIN`

Campos obrigatórios:
- **Escola**: `name`, `slug`
- **Admin**: `nome`, `email`, `telefone`

## Padronização de Commits

Utilizamos **Conventional Commits** com **Git Emoji**:

```
<emoji> <tipo>(<escopo>): <assunto>
```

### Tipos Principais

| Emoji | Tipo | Descrição |
|-------|------|-----------|
| ✨ | feat | Nova funcionalidade |
| 🐛 | fix | Correção de bug |
| 📚 | docs | Documentação |
| ♻️ | refactor | Refatoração |
| 🔧 | chore | Configuração |

### Escopos

- `auth` - Autenticação
- `dashboard` - Dashboards
- `platform` - Gestão de escolas
- `tenant` - Multi-tenancy
- `ui` - Componentes

### Referências

- 📖 [Commitojis](https://commitojis.vercel.app/)
- 📘 [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

---

**© 2025 Elo Escola** - Plataforma de Gestão Educacional
