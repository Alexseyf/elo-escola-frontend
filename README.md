# Elo Escola 🎓

Plataforma de gestão escolar focado em educação infantil para administradores, professores e responsáveis de alunos. Sistema moderno desenvolvido com tecnologias web de ponta.

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padronização de Commits](#padronização-de-commits)
- [Contribuindo](#contribuindo)

## Visão Geral

O **Elo Escola** é uma plataforma de gestão educacional que oferece diferentes interfaces e funcionalidades para três tipos de usuários:

- **Administradores**: Gestão completa do sistema e usuários
- **Professores**: Gerenciamento de turmas e avaliações
- **Responsáveis**: Acompanhamento do desempenho escolar

O projeto utiliza autenticação por email e senha, com roteamento dinâmico baseado em roles de usuário.

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.7** - Framework React com renderização do lado do servidor
- **React 19.1.0** - Biblioteca de UI com hooks
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS 4** - Utilitários CSS para estilização
- **Zustand 5.0.9** - Gerenciamento de estado minimalista

### UI & UX
- **Radix UI** - Componentes acessíveis e sem estilo
  - Dialog
  - Label
  - Separator
  - Slot
  - Tooltip
- **Lucide React** - Ícones SVG modernas
- **Sonner** - Sistema de notificações tipo toast

### Desenvolvimento
- **ESLint 9** - Linting de código JavaScript/TypeScript
- **TailwindCSS PostCSS** - Processamento de CSS

## Requisitos

- **Node.js**: v18+ (recomendado v20+)
- **npm** ou **yarn**: Gerenciador de pacotes
- **Git**: Para versionamento

## Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Alexseyf/elo-escola.git
cd elo
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com as configurações necessárias
```

## Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```
A aplicação será acessada em `http://localhost:3000`

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
elo/
├── app/                          # Diretório principal do Next.js 13+
│   ├── admin/dashboard/          # Dashboard administrativo
│   ├── professor/dashboard/      # Dashboard do professor
│   ├── responsavel/dashboard/    # Dashboard do responsável
│   ├── login/                    # Página de login
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Página inicial
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes React reutilizáveis
│   ├── Sidebar.tsx               # Componente de sidebar
│   ├── auth/
│   │   └── RouteGuard.tsx        # Guard para rotas protegidas
│   └── ui/                       # Componentes de UI base
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── tooltip.tsx
│       └── alert.tsx
│
├── hooks/                        # React hooks customizados
│   └── use-mobile.ts             # Hook para detecção de dispositivo mobile
│
├── stores/                       # Stores Zustand
│   └── useAuthStore.ts           # Store de autenticação
│
├── utils/                        # Funções utilitárias
│   ├── sidebarItems.ts           # Configuração de itens da sidebar
│   └── (utilitários gerais)
│
├── lib/                          # Código de biblioteca
│   └── utils.ts                  # Funções utilitárias compartilhadas
│
├── public/                       # Arquivos estáticos
│   ├── logo.png
│   └── (ícones e imagens)
│
├── config.ts                     # Configuração da aplicação
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Configuração Tailwind CSS
├── next.config.ts                # Configuração Next.js
├── package.json                  # Dependências do projeto
└── README.md                     # Este arquivo
```

## Padronização de Commits

Utilizamos a convenção **Conventional Commits** combinada com **Git Emoji** para manter um histórico claro, semântico e visualmente organizado.

### Formato

```
<emoji> <tipo>(<escopo>): <assunto>

<corpo opcional>

<rodapé opcional>
```

### Tipos de Commit e Emojis

Utilizamos o padrão de [Commitojis](https://commitojis.vercel.app/):

| Emoji | Código | Tipo | Descrição | Exemplo |
|-------|--------|------|-----------|---------|
| ✨ | `:sparkles:` | **feat** | Nova funcionalidade | `✨ feat(auth): implementar autenticação por email` |
| 🐛 | `:bug:` | **fix** | Correção de bug | `🐛 fix(dashboard): corrigir cálculo de média` |
| 📚 | `:books:` | **docs** | Mudanças em documentação | `� docs: atualizar README com instruções` |
| 💄 | `:lipstick:` | **style** | Estilização de interface | `💄 feat(ui/button): atualizar cores do tema` |
| ♻️ | `:recycle:` | **refactor** | Refatoração de código | `♻️ refactor(sidebar): simplificar estrutura` |
| ⚡ | `:zap:` | **perf** | Melhorias de performance | `⚡ perf(dashboard): otimizar renderização` |
| ✅ | `:white_check_mark:` | **test** | Testes | `✅ test(auth): adicionar testes de login` |
| 🔧 | `:wrench:` | **chore** | Configuração e dependências | `🔧 chore: atualizar dependências` |
| 🚀 | `:rocket:` | **deploy** | Deploy e CI/CD | `🚀 deploy: configurar GitHub Actions` |
| 🧹 | `:broom:` | **cleanup** | Limpeza de código | `🧹 cleanup: remover imports não utilizados` |
| 💥 | `:boom:` | **fix** | Revertendo mudanças importantes | `💥 fix: reverter alterações quebradas` |
| 🔒️ | `:lock:` | **security** | Melhorias de segurança | `🔒️ security(auth): implementar validação adicional` |
| 🏷️ | `:label:` | **types** | Tipagem TypeScript | `🏷️ types: adicionar tipos para novo componente` |
| 🥅 | `:goal_net:` | **error-handling** | Tratamento de erros | `🥅 error-handling: melhorar mensagens de erro` |

### Escopos Comuns

- `auth` - Autenticação e autorização
- `login` - Página e funcionalidades de login
- `dashboard` - Dashboards (admin, professor, responsável)
- `ui` - Componentes de interface do usuário
- `ui/button`, `ui/card`, `ui/input` - Componentes específicos
- `sidebar` - Barra lateral de navegação
- `store` - Estado global (Zustand)
- `api` - Comunicação com API
- `hooks` - React hooks customizados
- `docs` - Documentação
- `deps` - Dependências do projeto


### Regras Importantes

✅ **Faça:**
- Sempre comece com o emoji correspondente ao tipo
- Use presente do indicativo ("adiciona" não "adicionou")
- Seja específico e descritivo no escopo
- Limite o assunto a ~50 caracteres (após emoji e tipo)
- Separe assunto do corpo com linha em branco
- Use o corpo para explicar *o quê* e *por quê*, não *como*
- Referencie issues quando aplicável: `Closes #123` ou `Fixes #456`

❌ **Não faça:**
- Esqueça o emoji no início da mensagem
- Combine múltiplas funcionalidades em um commit
- Use mensagens genéricas como "ajustes", "correções" ou "atualizar"
- Commits com assunto completamente em maiúsculas
- Adicione pontuação no final do assunto (sem ponto final)

### Referências Úteis

- 📖 [Commitojis - Convenção de Emojis para Commits](https://commitojis.vercel.app/)
- 📘 [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

