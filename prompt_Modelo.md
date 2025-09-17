# 📝 Prompt de Desenvolvimento: Projeto MagicBox

**Título do Projeto:** MagicBox - Sua Caixa Mágica de Finanças Pessoais

**Objetivo Principal:** Desenvolver a aplicação web de controle financeiro "MagicBox", partindo de um ambiente parcialmente configurado. O foco é criar uma experiência de usuário (UX) excepcional, com uma **landing page visualmente atrativa e interativa**, e implementar todas as funcionalidades descritas, seguindo rigorosamente a arquitetura de software definida.

**Instruções Gerais:**
*   **Nome do Projeto:** MagicBox
*   **Tecnologias:** Next.js 14, MUI 5 (Tema "Modernize"), RTK Query, Next-Auth, React Hook Form.
*   **Guia Central:** Este documento e o `README.md` do projeto são as fontes da verdade para a arquitetura e funcionalidades.

---

## 1. Arquitetura de Pastas e Organização do Código

A estrutura do projeto deve seguir este padrão para garantir consistência e escalabilidade.

```
src/
├── app/
│   ├── (public)/                 # Grupo de rotas públicas
│   │   ├── page.tsx              # Landing Page (Componente principal)
│   │   ├── about/
│   │   │   └── page.tsx          # Exemplo de página pública
│   │   ├── layout.tsx            # Layout para rotas públicas
│   │   ├── loading.tsx           # Loading para rotas públicas
│   │   └── types/                # Tipagens específicas para rotas públicas
│   ├── (private)/                # Grupo de rotas protegidas por autenticação
│   │   ├── dashboard/
│   │   │   ├── components/       # Componentes específicos do Dashboard
│   │   │   ├── hooks/            # Hooks com lógica do Dashboard
│   │   │   └── page.tsx          # Página inicial do Dashboard
│   │   ├── layout/               # Componentes de layout para rotas privadas
│   │   │   ├── horizontal/
│   │   │   │   ├── header/
│   │   │   │   │   └── Header.tsx
│   │   │   │   └── navbar/
│   │   │   │       ├── Menudata.ts
│   │   │   │       ├── NavCollapse/
│   │   │   │       │   └── NavCollapse.tsx
│   │   │   │       ├── Navigation.tsx
│   │   │   │       ├── NavItem/
│   │   │   │       │   └── NavItem.tsx
│   │   │   │       └── NavListing/
│   │   │   │           └── NavListing.tsx
│   │   │   ├── shared/
│   │   │   │   ├── breadcrumb/
│   │   │   │   │   └── Breadcrumb.tsx
│   │   │   │   ├── customizer/
│   │   │   │   │   ├── Customizer.tsx
│   │   │   │   │   ├── RTL.tsx
│   │   │   │   │   └── typings.d.ts
│   │   │   │   ├── logo/
│   │   │   │   │   └── Logo.tsx
│   │   │   │   └── welcome/
│   │   │   │       └── Welcome.tsx
│   │   │   └── vertical/
│   │   │       ├── header/
│   │   │       │   ├── AppLinks.tsx
│   │   │       │   ├── data.ts
│   │   │       │   ├── Header.tsx
│   │   │       │   ├── MobileRightSidebar.tsx
│   │   │       │   ├── Navigation.tsx
│   │   │       │   ├── Notification.tsx
│   │   │       │   ├── Profile.tsx
│   │   │       │   ├── QuickLinks.tsx
│   │   │       │   └── Search.tsx
│   │   │       └── sidebar/
│   │   │           ├── MenuItems.ts
│   │   │           ├── module-name.d.ts
│   │   │           ├── NavCollapse/
│   │   │           │   └── index.tsx
│   │   │           ├── NavGroup/
│   │   │           │   └── NavGroup.tsx
│   │   │           ├── NavItem/
│   │   │           │   └── index.tsx
│   │   │           ├── SidebarItems.tsx
│   │   │           ├── SidebarProfile/
│   │   │           │   └── Profile.tsx
│   │   │           └── Sidebar.tsx
│   │   ├── cadastros/
│   │   │   ├── components/       # Componentes específicos (ex: FormCadastroConta.tsx)
│   │   │   ├── hooks/            # Hooks com lógica (ex: useCadastros.ts)
│   │   │   └── page.tsx          # Página principal do módulo de Cadastros
│   │   ├── extrato/
│   │   │   ├── components/       # (ex: FiltroExtrato.tsx, TabelaExtrato.tsx)
│   │   │   ├── hooks/            # (ex: useExtrato.ts)
│   │   │   └── page.tsx
│   │   ├── lancamentos/
│   │   │   ├── components/       # (ex: FormularioLancamento.tsx)
│   │   │   ├── hooks/            # (ex: useLancamentos.ts)
│   │   │   └── page.tsx
│   │   ├── relatorios/
│   │   │   ├── components/       # (ex: GraficoGastos.tsx, CardKPI.tsx)
│   │   │   ├── hooks/            # (ex: useRelatorios.ts)
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # Layout principal para o grupo (private)
│   │   ├── loading.tsx           # Loading para o grupo (private)
│   │   └── types/
│   │       ├── auth/
│   │       │   └── auth.ts
│   │       └── layout/
│   │           └── sidebar.ts
│   ├── api/                      # Backend (Next.js Route Handlers)
│   │   ├── auth/[...nextauth]/   # Rota do Next-Auth
│   │   └── [module_name]/        # Ex: /api/despesas/
│   │       ├── GET.ts
│   │       └── POST.ts
│   └── app.tsx         
│   └── layout.tsx                # Layout raiz da aplicação
│   └── loading.tsx               
│   └── not-found.tsx                 
│   └── components/               
│   └── global.css             
├── data/                         # Arquivos JSON para simulação de DB
├── store/                          
├── utils/                          
├── services/                     # Lógica de API com RTK Query
│   ├── api.ts                    # Arquivo principal com createApi
│   ├── despesas.service.ts       # Endpoints de Despesas
│   ├── contas.service.ts         # Endpoints de Contas
│   └── lancamentos.service.ts    # Endpoints de Lançamentos
└── styles/                       # Estilos globais e configuração do tema MUI
```

---

## 2. Gerenciamento de Estado e API (RTK Query)

A comunicação com o backend será centralizada pelo RTK Query.

1.  **API Principal (`src/services/api.ts`):**
    *   Crie a API base usando `createApi` do Redux Toolkit.
    *   Defina as `tagTypes` (ex: `["Despesas", "Contas", "Lancamentos"]`) para controle de cache.
    *   **Não defina endpoints aqui.** Este arquivo apenas exportará a API base e o hook `injectEndpoints`.

2.  **Slices de API (`src/services/`):**
    *   Para cada módulo (ex: `lancamentos`), crie um arquivo de serviço (ex: `lancamentos.service.ts`) e interfaces para o tipo de dados.
    *   Neste arquivo, importe a API principal e use `api.injectEndpoints()` para adicionar os endpoints específicos daquele módulo (CRUD: `getLancamentos`, `addLancamento`, `updateLancamento`, `deleteLancamento`).
    *   Configure as tags `providesTags` e `invalidatesTags` em cada endpoint para automatizar o re-fetching de dados e garantir que a UI esteja sempre sincronizada.
    *   Exporte os hooks gerados automaticamente (ex: `useGetLancamentosQuery`, `useLazyGetLancamentosQuery`, `useAddLancamentoMutation`).

3.  **Redux Store:**
    *   O reducer e o store já estão configurados devido ao tema, incluindo `redux-persist` para persistir o tema do usuário. Certifique-se de que o `reducer` da API e o `middleware` do RTK Query sejam adicionados corretamente à store existente.

---

## 3. Landing Page (`/`) - A Primeira Impressão

**Objetivo:** Criar uma landing page pública que seja visualmente deslumbrante, interativa e que convença o usuário a se cadastrar. **Capriche nesta etapa!**

*   **Design e Animações:**
    *   Use um design limpo, com bastante espaço em branco e uma paleta de cores que transmita confiança e modernidade (derivada do tema "Modernize").
    *   Adicione **animações sutis** em elementos conforme o usuário rola a página (scroll animations), como fade-in e slide-in, para dar vida ao conteúdo.
    *   Crie um "Hero Section" com um título impactante (ex: "Desvende a mágica das suas finanças.") e um subtítulo claro.
    *   Utilize ilustrações ou gráficos abstratos de alta qualidade que representem finanças, organização e clareza.
*   **Interatividade:**
    *   Inclua uma pequena **demonstração interativa** de uma funcionalidade chave. Por exemplo, um mini-gráfico que se atualiza quando o usuário clica em botões como "Receita" ou "Despesa".
    *   Adicione um botão de Call-to-Action (CTA) claro e convidativo (ex: "Comece Gratuitamente" ou "Acesse sua MagicBox") que leve para a página de login/autenticação.
*   **Seções:** Hero, Funcionalidades, Prova Social e CTA Final.

---

## 4. Funcionalidades e Design (UX) do Dashboard

### 4.1. Header e Navegação
*   **Header:** Adapte o do tema "Modernize". Implemente a **Pesquisa Global** como uma ferramenta de navegação rápida que busca e redireciona para páginas da aplicação. Ao pesquisar, deverá mostrar o `title` (nome da página) e uma breve descrição daquela página que ao clicar deverá encaminhar o usuário para a respectiva tela.
*   **Navbar:** Adapte para os módulos: Dashboard, Cadastros, Lançamentos, Extrato e Relatórios.

### 4.2. Módulo: Cadastros (`/(private)/cadastros`)
*   **UX:** Use abas (Tabs) ou seções para separar "Despesas" e "Contas".
*   **Funcionalidades:**
    1.  **Cadastro de Despesa:** Formulário simples com um campo de texto para o nome da nova despesa.
    2.  **Cadastro de Conta:** Formulário mais completo:
        *   `Despesa`: Dropdown para associar a conta a uma despesa existente.
        *   `Nome da Conta`: Campo de texto.
        *   `Valor Estimado`: Campo numérico (opcional).
        *   `Dia do Vencimento`: Campo numérico de 1 a 31 (opcional).
        *   `Status`: Um Switch (toggle) para "Ativo/Inativo".
    3.  **Listagem e Edição:**
        *   Use uma **Data Grid (`@mui/x-data-grid`)** para listar todas as contas cadastradas, mostrando Despesa, Conta, Vencimento, Valor Estimado e Status.
        *   A grid deve permitir **edição em linha (inline editing)** para alterações rápidas.
        *   Adicione uma coluna de "Ações" com botões para **Editar** (abre um modal com o formulário preenchido) e **Excluir**. A exclusão deve pedir confirmação.
*   **Formulários:** Utilize `react-hook-form` e `yup` para validação.

### 4.3. Módulo: Lançamentos (`/(private)/lancamentos`)
*   **UX:** Apresente um formulário claro e direto, possivelmente como um Card centralizado na página.
*   **Funcionalidades (Formulário de Lançamento):**
    1.  **Tipo de Lançamento:** Um Switch para alternar entre "Pagamento" (lançamento único) e "Agendamento" (despesa recorrente/futura).
    2.  **Despesa e Conta:** Dois dropdowns. O de "Conta" é dependente do de "Despesa" (só mostra contas da despesa selecionada).
    3.  **Valor:** Campo numérico.
    4.  **Data:** Campo de data. O label deve mudar para "Data de Pagamento" ou "Data de Início" dependendo do tipo de lançamento.
    5.  **Descrição:** Campo de texto opcional.
    6.  **Parcelas:** (Visível apenas para "Agendamento") Campo numérico para definir o número de meses a repetir o lançamento.
*   **Lógica:**
    *   Ao selecionar uma conta, preencha automaticamente os campos "Valor" e "Data" (com o dia do vencimento no mês atual), se estiverem cadastrados.
    *   Ao submeter, a API deve criar os registros correspondentes no `lancamentos.json`.

### 4.4. Módulo: Extrato (`/(private)/extrato`)
*   **UX:** Página focada em dados. Use a **Data Grid (`@mui/x-data-grid`)** para exibir todos os lançamentos.
*   **Funcionalidades:**
    1.  **Visualização:** A grid deve mostrar colunas como Data, Despesa, Conta, Descrição, Valor Previsto, Valor Pago e Status (Atrasado, Pago, Pendente).
    2.  **Filtros Avançados:** Crie um painel de filtros acima da grid com:
        *   Filtro por período (mês/ano).
        *   Filtro por Despesa.
        *   Filtro por Conta.
        *   Filtro por Status.
    3.  **Ações:** Permita **excluir** lançamentos (individualmente ou em massa, usando checkboxes na grid). A exclusão deve abrir um modal de confirmação.

### 4.5. Módulo: Relatórios (`/(private)/relatorios`)
*   **UX:** Esta página deve ser altamente visual e interativa, focada em insights. Organize com um layout de grid (MUI Grid) para exibir múltiplos cards e gráficos.
*   **Funcionalidades:**
    1.  **Filtros Globais:** No topo da página, adicione filtros por `Período` (mês/ano ou intervalo de datas) e `Despesa`.
    2.  **Cards de Resumo:** Exiba cards com KPIs (Indicadores Chave de Desempenho) como:
        *   `Gasto Total no Período`
        *   `Déficit Total` (Soma de valores previstos não pagos)
        *   `Média de Gasto Mensal`
    3.  **Gráficos:**
        *   **Gráfico de Pizza/Rosca:** Mostrando a distribuição de gastos por despesa no período selecionado.
        *   **Gráfico de Barras:** Comparando `Valor Previsto` vs. `Valor Gasto` para cada despesa.
        *   **Gráfico de Linha:** Exibindo a evolução dos gastos totais ao longo dos últimos 6 ou 12 meses.
    4.  **Análise de Gastos:**
        *   Uma tabela/lista que detalha os gastos por conta dentro de uma despesa selecionada, mostrando o resumo mensal, anual ou em período do mês dos anos de acordo com os filtros escolhidos.
    5.  **Previsão de Gastos:** (Funcionalidade avançada) Um card que projeta os gastos para o próximo mês com base na média dos meses anteriores e nos agendamentos futuros.

---

## 5. Backend e Persistência de Dados (Simulado)

*   Utilize as **Route Handlers** do Next.js 14 para criar a API backend em `src/app/api/`.
*   Para cada módulo (`cadastros`, `lancamentos`, etc.), crie uma pasta em `src/app/api/`. Dentro de cada uma, crie arquivos para cada método HTTP (`GET`, `POST`, `PATCH`, `DELETE`).
*   **Simulação de Banco de Dados:** Para cada módulo, crie um arquivo `data.json` (ex: `despesas.json`, `lancamentos.json`) na pasta `data/`. As rotas da API irão ler e escrever nesses arquivos para persistir os dados, simulando um banco de dados real.
*   **Segurança:** Todas as rotas da API devem verificar a sessão do usuário (`Next-Auth`) e filtrar/salvar dados com base no ID do usuário.
*   **Tipagem e Autenticação:** O objeto `session` padrão do Next-Auth não inclui o `id` do usuário. Modifique a tipagem do Next-Auth para adicionar o campo `id` ao objeto `session` e ao `user`, para que ele esteja disponível em toda a aplicação.

---

## 6. Ponto de Partida e Ordem de Execução

1.  **Estrutura e Configuração:** Garanta que a estrutura de pastas e a configuração do RTK Query estejam exatamente como descrito.
2.  **Landing Page:** Construa a `(public)/page.tsx` com foco total na qualidade visual e interatividade.
3.  **Autenticação:** Configure o `Next-Auth` e o `layout.tsx` da pasta `(private)` para proteger as rotas. 
4.  **Módulo de Cadastros:** Desenvolva este módulo como o primeiro, implementando o ciclo completo: UI (`page.tsx` e `components/`) -> Lógica da API (`despesas.service.ts`, `contas.service.ts`) -> Lógica da UI (`hooks/`).
5.  **Módulos Subsequentes:** Prossiga com `Lançamentos`, `Extrato` e `Relatórios`, seguindo o mesmo padrão.