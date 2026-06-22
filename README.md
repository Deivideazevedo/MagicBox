# MagicBox — Sua Caixa Mágica de Finanças Pessoais

Aplicação web full-stack de controle financeiro pessoal, construída para transformar a forma como você visualiza e gerencia seu dinheiro: de números confusos para decisões claras e inteligentes.

---

## Visão Geral

O **MagicBox** é uma plataforma completa de gestão financeira pessoal que combina controle orçamentário, análise histórica, detecção de divergências, objetivos de poupança, gestão de dívidas e um assistente de IA financeiro — tudo em uma interface moderna e responsiva.

---

## Stack de Tecnologias

| Camada | Tecnologias |
|---|---|
| **Framework** | Next.js 14 (App Router, Turbo mode) |
| **Linguagem** | TypeScript 5.4 |
| **UI / Design** | MUI 5 + MUI X, Emotion, Tabler Icons |
| **Estado** | Redux Toolkit + RTK Query + Redux Persist |
| **Formulários** | React Hook Form + Yup + Zod |
| **Banco de Dados** | PostgreSQL via Neon (serverless) |
| **ORM** | Prisma 6 |
| **Autenticação** | NextAuth 4 (Google, GitHub, Azure AD, Credentials) + reCAPTCHA v3 |
| **IA / LLM** | Vercel AI SDK — OpenAI → Google Gemini → Groq (fallback multi-modelo) |
| **Notificações** | Nodemailer SMTP, Resend, Twilio SMS/WhatsApp |
| **Gráficos** | ApexCharts + react-apexcharts |
| **Exportação** | React PDF Renderer |
| **Animações** | React Spring |
| **Listas virtualizadas** | React Virtuoso |

---

## Funcionalidades

### Financeiro Core
- **Categorias** — categorias personalizadas com ícone e cor para organizar despesas, receitas e objetivos
- **Despesas** — fixas, variáveis e dívidas; com valor estimado, vencimento, parcelas e status
- **Receitas** — fixas e variáveis; com dia de recebimento e valor estimado
- **Lançamentos** — registro de pagamentos e agendamentos; operações em massa (bulk delete)
- **Objetivos** — metas financeiras (`META`) e reservas de emergência (`RESERVA`) com valor-alvo e data-alvo
- **Dívidas** — rastreamento de parcelas e aportes de pagamento

### Visualização e Análise
- **Dashboard** — painel com indicadores financeiros, heatmap de atividade e métricas de performance
- **Extrato** — histórico completo com filtros avançados, busca, paginação e export
- **Relatórios** — análise por período, breakdown por categoria, receita vs. despesa, médias, projeções
- **Evolução Anual** — gráficos históricos mês a mês e comparativo ano a ano
- **Progresso de Objetivos** — percentual atingido, valor restante e média mensal de aporte

### Conciliação Orçamentária
- **Divergências** — detecção automática de gaps entre planejado e realizado; reconciliação e ajuste de furos orçamentários

### Inteligência Artificial
- **Chat IA** — assistente financeiro em streaming com fallback multi-modelo (OpenAI → Google Gemini → Groq); ferramentas para consultar categorias, transações e gerar insights; rate limiting e log de uso

### Notificações Multi-canal
- **E-mail** — via SMTP (Nodemailer) ou Resend
- **SMS** — via Twilio
- **WhatsApp** — via Twilio
- **Log de entrega** — rastreamento de status por canal e por usuário

### Sistema e Segurança
- **Autenticação Multi-Provider** — Google, GitHub, Azure AD, e-mail/senha com bcrypt + reCAPTCHA v3
- **Log de Acesso** — histórico de logins com IP e geolocalização (cidade, país)
- **Gerenciamento de Usuários** — listagem, edição, exclusão em massa, histórico de acessos por usuário
- **Limpeza de Dados** — exclusão configurável por intervalo de datas com preview das entidades afetadas

---

## Modelos de Dados (Prisma)

```
User             — conta do usuário (email, senha, role, phone, status, origem)
Categoria        — categorias com nome, ícone, cor e status
Despesa          — despesas (FIXA | VARIAVEL | DIVIDA) com vencimento e parcelas
Receita          — receitas (FIXA | VARIAVEL) com dia de recebimento
Lancamento       — transações (pagamento | agendamento) vinculadas a despesa/receita/objetivo
Objetivo         — metas (META | RESERVA) com valor-alvo e data-alvo
AccessLog        — log de acesso com IP, latitude, longitude, cidade, país
AiUsageLog       — log de uso do chat IA com modelo, latência e status
NotificationLog  — log de campanhas de notificação por canal
NotificationUserLog — entrega individual por usuário e canal
```

---

## Rotas da Aplicação

### Públicas
| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/auth/login` | Login (credentials, Google, GitHub, Azure AD) |
| `/auth/register` | Cadastro de conta |
| `/about` | Sobre o projeto |
| `/privacy` | Política de privacidade |

### Privadas (autenticação obrigatória)
| Rota | Descrição |
|---|---|
| `/dashboard` | Painel principal com KPIs e heatmap |
| `/cadastros/dividas` | Gestão de dívidas e aportes |
| `/cadastros/objetivos` | Metas financeiras e reservas |
| `/lancamentos` | Registro e agendamento de transações |
| `/resumo` | Extrato detalhado |
| `/relatorios` | Relatórios e análise histórica |
| `/divergencias` | Reconciliação orçamentária |
| `/sistema` | Configurações e limpeza de dados |
| `/sistema/notificacoes` | Configuração de notificações e logs |
| `/usuarios` | Gerenciamento de usuários |

---

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou conta Neon)
- Conta Twilio (opcional, para SMS/WhatsApp)
- Chaves de API para provedores de IA (opcional)

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd Magic
```

### 2. Instale as dependências

```bash
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="gere-uma-chave-secreta-forte"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
RECAPTCHA_SECRET_KEY=""

# AI Providers (pelo menos um obrigatório)
OPENAI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""
GROQ_API_KEY=""

# Email
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
RESEND_API_KEY=""

# Twilio (SMS e WhatsApp)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_SMS_FROM=""
TWILIO_WHATSAPP_FROM=""
```

### 4. Execute as migrations do banco

```bash
npx prisma migrate deploy
```

### 5. Inicie o servidor de desenvolvimento

```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (Public)/               # Landing page, about, privacy
│   ├── (Private)/              # Rotas protegidas
│   │   ├── dashboard/          # Painel principal
│   │   ├── cadastros/          # Dívidas e objetivos
│   │   ├── lancamentos/        # Registro de transações
│   │   ├── resumo/             # Extrato
│   │   ├── relatorios/         # Relatórios e gráficos
│   │   ├── divergencias/       # Reconciliação orçamentária
│   │   ├── sistema/            # Configurações e notificações
│   │   └── usuarios/           # Gerenciamento de usuários
│   └── api/                    # Route Handlers (REST)
│       ├── auth/
│       ├── categorias/
│       ├── despesas/
│       ├── receitas/
│       ├── lancamentos/
│       ├── objetivos/
│       ├── dividas/
│       ├── relatorios/
│       ├── resumo/
│       ├── dashboard/
│       ├── divergencias/
│       ├── chat/
│       ├── sistema/
│       └── usuarios/
├── core/                       # Lógica de negócio (service layer)
├── services/                   # RTK Query endpoints
├── store/                      # Redux store e providers
├── lib/                        # Configurações (NextAuth, Prisma, error handler)
├── components/                 # Componentes React reutilizáveis
├── hooks/                      # Custom hooks
├── utils/                      # Funções utilitárias
├── dtos/                       # Data Transfer Objects (validação)
├── types/                      # Definições TypeScript
└── styles/                     # Estilos globais e tema
prisma/
├── schemas/                    # Modelos Prisma (multi-schema)
└── migrations/                 # Histórico de migrations
```

---

## Arquitetura

- **Service Layer** — lógica de negócio desacoplada da camada HTTP (`/core`)
- **DTO Pattern** — validação de entrada com Zod/Yup nos Route Handlers
- **RTK Query** — fetching, cache e invalidação automática no frontend
- **Server Components + Client Components** — estratégia híbrida com Next.js App Router
- **Soft Delete** — entidades com `deletedAt` para exclusão não-destrutiva
- **Multi-model AI Fallback** — OpenAI → Google Gemini → Groq com degradação automática

---

## Licença

Projeto privado. Todos os direitos reservados.
