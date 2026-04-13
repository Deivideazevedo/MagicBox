# Regras de Negócio: Resumo e Mini Cards

Este documento descreve as regras lógicas utilizadas para gerar o Resumo Financeiro e os Mini Cards de totalização do sistema.

## 1. Resumo Financeiro (Listagem Consolidada)

A listagem de resumo combina transações reais (lançamentos) com projeções automáticas baseadas em despesas/receitas recorrentes.

### 1.1. Tipos de Origem
- **Real**: Lançamentos existentes na tabela `lancamento` dentro do período selecionado.
- **Projetada (Recorrência)**: Projeções geradas via SQL para despesas/receitas que não possuem lançamento de **agendamento** para o mês de referência.

### 1.2. Regras de Projeção
- **Despesas Fixas**: Projetadas mensalmente a partir da `createdAt` se não houver lançamento vinculado para o mês/ano.
- **Dívidas**: Projetadas enquanto houver saldo devedor (`valorTotal - total_pago > 0`).
- **Receitas Fixas**: Projetadas mensalmente se `tipo = 'FIXA'` e `status = 'A'`.

### 1.3. Lógica de Data de Referência (Fechamento do Mês)
Para garantir que as projeções reflitam o calendário real:
- O sistema calcula dinamicamente o **último dia de cada mês** (`ultimo_dia_mes`).
- A data de referência é calculada usando `LEAST(diaConfigurado, ultimo_dia_mes)`. 
- Isso garante que uma conta configurada para o dia 31 apareça corretamente no dia 31 em meses longos, e se ajuste automaticamente para o dia 30, 29 ou 28 em meses curtos, sem "transbordar" para o mês seguinte.

### 1.4. Visibilidade por Estado (Pai)
A exibição de dados no Resumo é sensível ao estado do registro de origem (Receita, Despesa ou Meta):

- **Inativo (`status = 'I'`)**:
    - **Projeções**: O item para de ser projetado no futuro.
    - **Lançamentos Reais**: Todos os lançamentos passados permanecem visíveis para fins de histórico e saldo.
- **Deletado Suavemente (`deletedAt` preenchido)**:
    - **Projeções**: O item para de ser projetado.
    - **Lançamentos Reais**: Todos os lançamentos passados vinculados a este registro são **ocultados** da visão de Resumo e dos cálculos dos Mini Cards.

### 1.4. Lógica de Status
- **PAGO**: Quando existe um lançamento do tipo `pagamento` e o `valorPago >= valorPrevisto`.
- **PENDENTE**: Quando existe apenas agendamento ou projeção, e a data de vencimento ainda não passou.
- **ATRASADO**: Quando o vencimento passou e não há lançamento de `pagamento`.

### 1.5. Coexistência: Projeção vs. Lançamento Real
Diferente da maioria dos sistemas, o MagicBox mantém a referência da **projeção** mesmo após o registro de um pagamento real:

- **Propósito**: Permitir que o usuário compare o que foi planejado (`valorPrevisto`) com o que foi efetivamente gasto (`valorPago`), identificando variações parciais ou excedentes diretamente na interface.
- **Regra de Substituição**: A projeção automática (automática) só é **removida** do resumo se o usuário criar um **Agendamento Real** (lançamento manual do tipo `agendamento`) para aquele período. O agendamento manual é entendido como uma "tomada de controle" do usuário sobre aquele mês específico, invalidando a estimativa automática do sistema.
- **Pagamentos**: Registros de `pagamento` não anulam a projeção visual no card, apenas atualizam seu estado financeiro e de status.

---

## 2. Mini Cards (Totalizadores)

Os cards sumarizam a saúde financeira do período selecionado. A lógica garante que o **Total** reflita o cenário real (abatendo pendências com pagamentos e tratando excedentes).

| Campo | Descrição | Regra / Cálculo |
| :--- | :--- | :--- |
| **totalSaidas** | Teto Financeiro | `MAX(saidasPagas, saidasAgendadas)` |
| **saidasPagas** | Realizado | Soma de todos os lançamentos `pagamento` |
| **saidasAgendadas** | Previsto | `Agendamentos Manuais + Projeções Automáticas` |
| **diferencaSaidas** | Saldo de Gestão | `saidasAgendadas - saidasPagas` |

### 2.1. Interpretando a Diferença (diferencaSaidas/Entradas)
- **Valor Positivo (> 0)**: Indica o montante que ainda está **pendente** de pagamento/recebimento.
- **Valor Negativo (< 0)**: Indica que o orçamento foi **excedido** (você gastou/ganhou mais do que o previsto original).
- **Valor Zero (= 0)**: Indica que o realizado bateu exatamente com o previsto.

### 2.2. Diferença entre Agendamento e Projeção
- **Agendamento**: Registro real criado pelo usuário no banco (`tipo = 'agendamento'`).
- **Projeção**: Cálculo virtual do sistema para itens recorrentes que ainda não possuem agendamento para o mês. Uma projeção é automaticamente "calada" por um agendamento manual.

---

## 3. Validação e Integridade (Zod)

Para garantir que o motor de projeção funcione corretamente, os esquemas de validação (`superRefine`) aplicam:

- **Obrigatórios para FIXA/DIVIDA**: `valorEstimado` e `diaVencimento`/`diaRecebimento`. Sem esses dados, o SQL não consegue calcular as datas de referência.
- **Opcionais para VARIAVEL**: Permite maior flexibilidade para registros pontuais.

---

## 4. Identidade de Dados (IDs)
Os IDs do resumo seguem o padrão `${tipo}-${origemId}-${mes}-${ano}` para garantir unicidade. Detalhes projetados compartilham o mesmo ID base para manter a sincronia na interface.

---
