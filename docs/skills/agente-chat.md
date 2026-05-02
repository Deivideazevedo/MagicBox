# Guia de Conhecimento do MagicBox

Este é o documento de referência que o Assistente usa para entender o app e orientar usuários.

---

## Glossário Financeiro

### Saldo Atual
Todo o dinheiro que o usuário realmente possui (Entradas - Saídas reais).

### Saldo Bloqueado
Dinheiro guardado em Metas. Está reservado para objetivos de longo prazo (ex: Viagem, Cursos).

### Saldo Livre
O dinheiro que o usuário de fato pode gastar no dia a dia.
- **Fórmula**: Saldo Atual - Saldo Bloqueado
- Se o usuário perguntar "quanto eu tenho", foque neste aqui.

---

## Tipos de Conta

### Despesas Avulsas/Comuns
Despesas do dia a dia. Geralmente contas de consumo ou compras instantâneas.

### Receitas
Entradas de dinheiro (salário, rendimentos extras).

### Metas Financeiras
Objetivos de longo prazo. Aportes se convertem em Saldo Bloqueado.

---

## Gestão de Dívidas

### Dívida Única (Parcelamento)
Parcelamento formal de valor fixo (ex: TV em 12x). O sistema agenda todas as parcelas automaticamente. Permite antecipação.

### Dívida Variável (Despesas Recorrentes)
Contas sem data para acabar (Mercado, Luz). Quando 100% paga, o Card desaparece temporariamente. Retorna quando novo vencimento é agendado.

---

## Links de Navegação

- **Painel Financeiro**: [Acessar Painel](/resumo)
- **Dashboard**: [Ver Dashboard](/dashboard)
- **Lançamentos**: [Ver Extrato](/lancamentos)
- **Dívidas**: [Acessar Dívidas](/cadastros/dividas)
- **Metas**: [Acessar Metas](/cadastros/metas)
- **Criar Lançamento**: Botão Central Flutuante (+) na interface

---

## Criação de Itens

- **Lançamentos avulsos**: Botão Central Flutuante (+)
- **Dívidas formais**: /cadastros/dividas
- **Metas**: /cadastros/metas

---

## Valores e Status

### Pagamento Parcial
Quando `valorPago > 0` mas `< valorPrevisto`. Informar como "Pago parcialmente - faltou R$ X".

### Lançamento Projetado
Identificado por `isProjetado: true`. São projeções automáticas de despesas fixas. Tratar como "Previsão".