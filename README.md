# ✨ MagicBox - Sua Caixa Mágica de Finanças Pessoais

Bem-vindo ao **MagicBox**, uma aplicação web moderna e intuitiva para controle financeiro pessoal. O objetivo é transformar a maneira como você visualiza e gerencia seu dinheiro, tornando o processo não apenas fácil, mas também revelador e agradável.

![Banner do Projeto](https://via.placeholder.com/1200x400.png/001E3A/FFFFFF?text=MagicBox%20-%20Controle%20Financeiro%20Inteligente )
*(Nota: Substitua o placeholder por um banner real do projeto)*

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
│   ├── (public)/
│   │   └── page.tsx            # Landing Page
│   ├── dashboard/              # Rotas protegidas
│   │   ├── cadastros/
│   │   ├── extrato/
│   │   ├── lancamentos/
│   │   ├── relatorios/
│   │   └── layout.tsx          # Layout principal do Dashboard
│   │   └── page.tsx            # Página inicial do Dashboard
│   ├── api/                    # Backend (Route Handlers)
│   │   ├── auth/
│   │   └── [module]/
│   │       ├── GET.ts
│   │       └── POST.ts
│   └── layout.tsx              # Layout raiz
├── components/                 # Componentes globais (Header, Navbar, etc.)
├── data/                       # Arquivos JSON para simulação de DB
│   ├── despesas.json
│   └── lancamentos.json
├── lib/                        # Configurações (Redux, NextAuth)
├── services/                   # Lógica de API com RTK Query
│   ├── api.ts                  # createApi
│   └── endpoints/
│       └── despesasApi.ts      # Endpoints injetáveis
└── styles/                     # Estilos globais e tema
```

---

## 🤝 Contribuição

Este é um projeto em desenvolvimento. Contribuições são bem-vindas! Sinta-se à vontade para abrir *issues* para relatar bugs ou sugerir novas funcionalidades.

```
