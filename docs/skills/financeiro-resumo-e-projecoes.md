# Skill: Resumo Financeiro e Projeções

Esta skill descreve o funcionamento do motor de inteligência financeira do MagicBox, responsável por prever gastos e calcular a saúde do caixa.

## 1. O Motor de Projeção (SQL)
O sistema gera "projeções virtuais" que coexistem com os lançamentos reais.

### O que é projetado:
- **Despesas FIXAS**: Projetadas mensalmente a partir da data de criação (`createdAt`).
- **Dívidas (DIVIDA)**: Projetadas mensalmente enquanto houver saldo devedor (`valorTotal - totalPago > 0`).
- **Receitas FIXAS**: Projetadas mensalmente se estiverem com `status = 'A'`.

### Regra de Coexistência (Projeção vs Reality):
- Uma **projeção automática** é "calada" (removida do resumo) apenas se o usuário criar um **Agendamento Manual** (`tipo = 'agendamento'`) para aquele registro no mesmo mês/ano.
- Lançamentos do tipo **Pagamento** NÃO removem a projeção da lista; eles a atualizam para o status "Pago", permitindo comparar o Planejado vs Realizado.

## 2. Ajuste de Calendário (`ultimo_dia_mes`)
Para evitar erros em meses curtos (ex: Fevereiro):
- O sistema calcula o último dia do mês e usa `LEAST(diaConfigurado, ultimo_dia_mes)`.
- Se uma conta vence dia 31, em Fevereiro ela será projetada para o dia 28 (ou 29), sem transbordar para Março.

## 3. Lógica de Mini Cards (Totais)
Os totais exibidos no topo do Dashboard seguem a regra do "Teto Financeiro":
- **Total Saídas**: `MAX(saidasPagas, saidasPrevistas)`.
- Isso garante que se você gastar MAIS do que o planejado (excedente), o total reflita o gasto real. Se gastar MENOS, o total reflete o compromisso planejado até que o mês feche.

## 4. Cálculo de Status
O status de cada item no resumo é determinado pela função `calcularStatus`:
- **PAGO**: `valorPago >= valorPrevisto`.
- **PARCIAL**: `valorPago > 0` mas `< valorPrevisto`.
- **VENCIDO**: `valorPago = 0` e `dataVencimento < hoje`.
- **VENCE HOJE / VENCE EM X DIAS**: Prazos futuros sem pagamento.

## 5. Tipos de Saldo
- **Saldo Atual**: Dinheiro que entrou menos o que saiu (realizado).
- **Saldo Projetado**: Previsão de quanto sobrará no fim do mês (considerando pendências).
- **Saldo Bloqueado**: Soma de aportes em **Metas Ativas**.
- **Saldo Livre**: `Saldo Atual - Saldo Bloqueado`. Representa o dinheiro que pode ser gasto sem comprometer os objetivos.

---
**Validação em Código:**
- SQL verificado em `src/core/lancamentos/resumo/repository.ts`
- Lógica de status verificada em `src/core/lancamentos/resumo/utils.ts`
