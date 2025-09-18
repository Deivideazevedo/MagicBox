This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

---

## 🚀 Visão Geral do Projeto

O MagicBox é construído com uma stack de tecnologias de ponta para oferecer uma experiência de usuário rápida, responsiva e rica em funcionalidades. A aplicação permite que os usuários cadastrem suas despesas e contas, lancem transações diárias, visualizem extratos detalhados e obtenham insights valiosos através de relatórios e gráficos interativos.

### Principais Funcionalidades:
-   **Dashboard Intuitivo:** Uma visão geral e imediata da sua saúde financeira.
-   **Cadastro Flexível:** Gerencie categorias de despesas e contas detalhadas (com valor estimado, vencimento, etc.).
-   **Lançamentos Rápidos:** Um fluxo otimizado para registrar pagamentos e agendar despesas futuras, incluindo parcelamentos.
-   **Extrato Detalhado:** Visualize, filtre e gerencie todos os seus lançamentos em uma grade de dados poderosa.
-   **Relatórios Visuais:** Gráficos interativos que transformam números em insights claros sobre seus hábitos de consumo.
-   **Autenticação Segura:** Proteção de dados com `Next-Auth`.
-   **Design Moderno:** Interface elegante e profissional baseada no tema **Modernize MUI**.

---

## 🛠️ Stack de Tecnologias

*   **Framework:** [Next.js 14](https://nextjs.org/ ) (com App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/ )
*   **UI Kit:** [MUI 5](https://mui.com/ ) & [MUI X](https://mui.com/x/ )
*   **Tema:** Modernize MUI Theme
*   **Gerenciamento de Estado:** [Redux Toolkit (RTK)](https://redux-toolkit.js.org/ ) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview )
*   **Persistência de Estado:** [Redux Persist](https://github.com/rt2zz/redux-persist )
*   **Formulários:** [React Hook Form](https://react-hook-form.com/ ) & [Yup](https://github.com/jquense/yup )
*   **Autenticação:** [Next-Auth](https://next-auth.js.org/ )
*   **Backend (Simulado):** Next.js Route Handlers
*   **Banco de Dados (Simulado):** Arquivos `JSON` locais

---

## ⚙️ Configuração e Instalação

O ambiente do projeto já está parcialmente configurado. Para rodar a aplicação localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd MagicBox
    ```

2.  **Instale as dependências:**
    O projeto utiliza `yarn` como gerenciador de pacotes.
    ```bash
    yarn install
    ```
    
3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione as chaves necessárias para o `Next-Auth` (ex: `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`).
    ```env
    # Exemplo para autenticação com GitHub
    GITHUB_ID=seu_github_id
    GITHUB_SECRET=seu_github_secret
    NEXTAUTH_SECRET=gere_uma_chave_secreta_aqui
    ```

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    yarn dev
    ```

5.  **Acesse a aplicação:**
    Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000 ).

---

## 📂 Estrutura do Projeto

A arquitetura do projeto é modular e escalável, organizada da seguinte forma:

```
src/
├── app/
│   ├── (Public)/               # Rotas públicas (landing page, about)
│   ├── (Private)/dashboard/    # Rotas protegidas do dashboard
│   │   ├── cadastros/          # Gestão de despesas e contas
│   │   │   ├── components/     # Components específicos de cadastros
│   │   │   ├── hooks/          # Hooks de cadastros (useDespesas, useContas)
│   │   ├── extrato/            # Visualização de lançamentos
│   │   │   ├── components/     # Components de extrato
│   │   │   ├── hooks/          # Hooks de extrato
│   │   ├── lancamentos/        # Registro de transações
│   │   │   ├── components/     # Components de lançamentos
│   │   │   ├── hooks/          # Hooks de lançamentos
│   │   ├── relatorios/         # Gráficos e análises
│   │   │   ├── components/     # Components de relatórios
│   │   │   ├── hooks/          # Hooks de relatórios
│   │   ├── layout/             # Layouts do dashboard
│   │   ├── types/              # Tipos do dashboard
│   ├── api/                    # Backend (Route Handlers)
│   │   ├── auth/
│   │   ├── contas/
│   │   ├── despesas/
│   │   ├── lancamentos/
│   │   ├── users/
│   ├── components/             # Componentes globais reutilizáveis
├── components/                 # Componentes globais compartilhados
├── data/                       # Arquivos JSON para simulação de DB
│   ├── contas.json
│   ├── despesas.json
│   ├── lancamentos.json
│   ├── users.json
├── lib/                        # Configurações (Redux, NextAuth)
├── services/                   # RTK Query endpoints
│   ├── api.ts
│   ├── despesaService.ts
│   ├── types.ts
│   ├── endpoints/
│   │   ├── contasApi.ts
│   │   ├── despesasApi.ts
│   │   ├── lancamentosApi.ts
├── store/                      # Redux store, providers, customizer
├── utils/                      # Utilitários globais
└── styles/                     # Estilos globais e tema
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
