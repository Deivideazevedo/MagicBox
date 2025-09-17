# Instruções para Agentes de IA - MagicBox

Este documento fornece orientações essenciais para trabalhar eficientemente com o **MagicBox**, uma aplicação de controle financeiro pessoal construída com Next.js.

## Visão Geral do Projeto

O MagicBox é uma aplicação financeira que permite:
- **Dashboard intuitivo** com visão geral da saúde financeira
- **Cadastro flexível** de categorias de despesas e contas
- **Lançamentos rápidos** com suporte a parcelamentos
- **Extrato detalhado** com filtros e gerenciamento
- **Relatórios visuais** com gráficos interativos

## Estrutura do Projeto

Arquitetura modular organizada em:

```
src/
├── app/
│   ├── (Public)/              # Rotas públicas (landing page)
│   ├── (Private)/dashboard/   # Rotas protegidas do dashboard
│   │   ├── cadastros/         # Gestão de categorias e contas
│   │   ├── extrato/          # Visualização de lançamentos
│   │   ├── lancamentos/      # Registro de transações
│   │   └── relatorios/       # Gráficos e análises
│   └── api/                  # Backend com Route Handlers
├── components/               # Componentes globais reutilizáveis
├── data/                    # Arquivos JSON para simulação de DB
├── lib/                     # Configurações (Redux, NextAuth)
├── services/                # RTK Query endpoints
└── styles/                  # Estilos globais e tema
```

## Padrões Importantes

### Autenticação e Roteamento
- **NextAuth.js** para autenticação segura
- Middleware em `src/middleware.ts` protege rotas do dashboard
- Rotas públicas: `/`, `/about`
- Todas as rotas `/dashboard/*` requerem autenticação

### Gerenciamento de Estado
- **Redux Toolkit (RTK)** + **RTK Query** para estado e APIs
- **Redux Persist** para persistência de dados
- Configuração em `src/lib/` e `src/services/`
- Endpoints injetáveis em `src/services/endpoints/`

### Backend Simulado
- **Next.js Route Handlers** simulam backend real
- Dados persistidos em arquivos JSON locais (`src/data/`)
- Padrão: `src/app/api/[module]/route.ts` para CRUD operations

### UI/UX Financeiro
- **MUI 5** + **MUI X** com tema **Modernize**
- Componentes especializados para dados financeiros
- Grids de dados para extratos e relatórios
- Gráficos interativos com ApexCharts

## Workflows de Desenvolvimento

### Configuração Inicial
```bash
yarn install
yarn dev  # Porta padrão: 3000
```

### Desenvolvimento de Features Financeiras
1. **Modelos de dados**: Definir em `src/data/[entidade].json`
2. **API endpoints**: Criar em `src/services/endpoints/[entidade]Api.ts`
3. **Route handlers**: Implementar em `src/app/api/[entidade]/route.ts`
4. **Componentes UI**: Desenvolver em `src/app/(Private)/dashboard/[feature]/`

### Práticas Recomendadas
- Usar RTK Query para todas as operações de dados
- Implementar validação com React Hook Form + Yup
- Seguir padrões de componentes MUI para consistência
- Manter simulação de backend realista para desenvolvimento

## Domínio Financeiro

### Entidades Principais
- **Despesas**: Categorias com valor estimado e vencimento
- **Contas**: Diferentes tipos de contas financeiras
- **Lançamentos**: Transações com suporte a parcelamento
- **Relatórios**: Análises e insights visuais

### Fluxos Críticos
- **Cadastro de despesas** → Lançamentos → Extrato → Relatórios
- **Gestão de parcelamentos** e agendamentos
- **Filtros e buscas** no extrato para análise detalhada

## Stack Tecnológica
- Next.js 14 (App Router) + TypeScript
- MUI 5 + MUI X + Modernize Theme
- Redux Toolkit + RTK Query + Redux Persist
- React Hook Form + Yup
- NextAuth.js
- ApexCharts para visualizações

Este projeto foca em proporcionar uma experiência intuitiva para controle financeiro pessoal com interface moderna e funcionalidades robustas.