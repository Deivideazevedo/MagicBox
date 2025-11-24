# Instruções para Agentes de IA - MagicBox

## Análise do Comportamento e Lógica do Projeto

- O projeto MagicBox é uma migração fiel de uma planilha financeira, onde o agrupamento de contas por categorias é fundamental.
- **Despesa** é uma categoria macro (ex: Carro, Pessoal, Alimentação) que serve para organizar e filtrar os lançamentos. Não possui valor previsto ou vencimento diretamente.
- **Conta** é um item financeiro vinculado a uma despesa (ex: Manutenção preventiva, Pneus, Cartão de crédito, Supermercado). Cada conta possui valor previsto, vencimento (opcional), status (ativa/inativa) e é o alvo dos lançamentos.
- **Lançamento** é uma transação financeira que sempre vincula uma conta (e, por consequência, uma despesa). Pode ser agendado (se a conta tem vencimento) ou pago (registrando valor pago). Suporta parcelamento e agendamento apenas se houver vencimento.
- O fluxo correto é: Cadastro de categorias → Cadastro de contas (vinculadas à despesa) → Lançamentos (seleciona despesa, depois conta) → Extrato → Relatórios.
- Agendamento só é possível se a conta possuir vencimento. Valor previsto é usado para agendamento, valor pago para registro de pagamento.
- Relatórios e extratos devem consumir dados dos lançamentos via API, permitindo filtros por despesa, conta, período, status, etc.
- Toda lógica de validação (parcelamento, agendamento, vinculação de conta/despesa) deve respeitar o agrupamento e regras originais da planilha.
- Remover todos os dados mocados dos módulos, persistir dados nos arquivos JSON da pasta `data` e consumir via API.

Essas diretrizes garantem que qualquer agente de IA ou desenvolvedor mantenha o alinhamento com o comportamento original da planilha e a lógica financeira do projeto.

Este documento fornece orientações essenciais para trabalhar eficientemente com o **MagicBox**, uma aplicação de controle financeiro pessoal construída com Next.js.

## Visão Geral do Projeto

O MagicBox é uma aplicação financeira que permite:
- **Dashboard intuitivo** com visão geral da saúde financeira
- **Cadastro flexível** de categorias de categorias e contas
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
│   │   ├── [modulo]/          # Cada módulo (cadastros, extrato, etc.)
│   │   │   ├── page.tsx       # Página principal do módulo
│   │   │   ├── components/    # Componentes visuais do módulo
│   │   │   ├── hooks/         # Hooks com toda a lógica de dados, chamadas à API, validação
│   │   │   └── ...            # Outros arquivos específicos
│   └── api/                  # Backend com Route Handlers
├── components/               # Componentes globais reutilizáveis
├── data/                    # Arquivos JSON para simulação de DB
├── lib/                     # Configurações (Redux, NextAuth)
├── services/                # RTK Query endpoints
└── styles/                  # Estilos globais e tema
```

**Regra de separação:**
- Toda lógica de dados, manipulação, chamadas à API e validação deve estar nos hooks do módulo.
- Os componentes devem ser apenas visuais, recebendo dados e funções dos hooks.
- Nunca implemente lógica de negócio diretamente nos componentes.

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

## Diretrizes de Dados e Integração

- **Remover dados mocados:** Não utilizar arrays, objetos ou variáveis estáticas para dados de categorias, contas, lançamentos ou relatórios nos componentes, hooks ou páginas. Todos os dados devem ser persistidos nos arquivos JSON da pasta `src/data`.
- **Salvar dados no JSON:** Ao cadastrar, editar ou excluir categorias, contas ou lançamentos, garantir que as operações sejam refletidas nos arquivos `categorias.json`, `contas.json`, `lancamentos.json` e `users.json`.
- **Consumir dados via API:** Utilizar os endpoints da API (em `src/app/api/[entidade]/route.ts`) para buscar, criar, atualizar e remover dados. O consumo deve ser feito via RTK Query nos hooks e componentes, nunca diretamente do arquivo JSON.
- **Exemplo de fluxo correto:**
	1. Usuário cadastra uma nova conta → chamada POST para `/api/contas` → salva em `contas.json`.
	2. Componente lista contas → chamada GET para `/api/contas` → retorna dados do JSON via API.
	3. Remoção/edição segue o mesmo padrão, sempre refletindo no arquivo JSON e nunca em dados estáticos.

- **Validação:** Garantir que toda lógica de validação (parcelamento, agendamento, vinculação de conta/despesa) respeite o agrupamento e regras originais da planilha.

- **Relatórios e extratos:** Devem consumir dados dos lançamentos via API, permitindo filtros por despesa, conta, período, status, etc.

- **Manutenção dos dados:** Sempre que possível, manter os dados organizados e consistentes nos arquivos JSON, evitando duplicidade ou inconsistência entre o frontend e o backend simulado.

## Domínio Financeiro


### Entidades Principais
- **Categorias**: São categorias macro (ex: Carro, Pessoal, Alimentação) que agrupam várias contas relacionadas. Não possuem valor previsto ou vencimento diretamente, mas servem para organizar e filtrar os lançamentos.
- **Contas**: São itens financeiros vinculados a uma despesa (ex: Manutenção preventiva, Pneus, Cartão de crédito, Supermercado). Cada conta possui valor previsto, vencimento (opcional), status (ativa/inativa) e é o alvo dos lançamentos.
- **Lançamentos**: Transações financeiras que sempre vinculam uma conta (e, por consequência, uma despesa). Podem ser agendados (se a conta tem vencimento) ou pagos (registrando valor pago). Suportam parcelamento e agendamento apenas se houver vencimento.
- **Relatórios**: Análises e insights visuais baseados nos lançamentos, agrupados por despesa ou conta.

### Fluxos Críticos
- **Cadastro de categorias** → Cadastro de contas (vinculadas à despesa) → Lançamentos (seleciona despesa, depois conta) → Extrato → Relatórios
- **Gestão de parcelamentos** e agendamentos (somente para contas com vencimento)
- **Filtros e buscas** no extrato por despesa, conta, período, status, etc.

## Stack Tecnológica
- Next.js 14 (App Router) + TypeScript
- MUI 5 + MUI X + Modernize Theme
- Redux Toolkit + RTK Query + Redux Persist
- React Hook Form + Yup
- NextAuth.js
- ApexCharts para visualizações

Este projeto foca em proporcionar uma experiência intuitiva para controle financeiro pessoal com interface moderna e funcionalidades robustas.