# Skill: Resumo Financeiro e Projeções

Esta skill descreve o funcionamento do motor canônico de inteligência financeira do MagicBox (`getCanonicBaseCTE`), responsável por consolidar lançamentos, prever gastos e calcular a saúde do caixa.

## 1. O Motor de Projeção Canônico (SQL)
O sistema gera "projeções virtuais" que coexistem com os lançamentos reais via `FULL OUTER JOIN`.

### O que é projetado virtualmente (`CROSS JOIN`):
- **Despesas FIXAS**: Projetadas mensalmente a partir da data de criação (`createdAt`).
- **Receitas FIXAS**: Projetadas mensalmente se estiverem com `status = 'A'`.
- *Nota*: Dívidas geram parcelas físicas (`tipo = 'agendamento'`) no ato do cadastro e variáveis entram pelo realizado.

### Regra de Coexistência (Projeção vs Reality):
- Uma **projeção automática** é "calada" (descartada do resumo) se houver um **Agendamento Real** (`tipo = 'agendamento'`) para aquele item no mesmo mês/ano.
- Lançamentos do tipo **Pagamento** NÃO removem a projeção da lista; eles a atualizam para o status "Pago", permitindo comparar o Planejado vs Realizado.
- Pagamentos com a tag `[QUITAÇÃO]` ajustam `valorPrevisto = valorPago` e encerram as pendências daquele mês.

## 2. Ajuste de Calendário (`ultimo_dia_mes`)
Para evitar erros em meses curtos (ex: Fevereiro):
- O sistema calcula o último dia do mês e usa `LEAST(diaConfigurado, ultimo_dia_mes)`.
- Se uma conta vence dia 31, em Fevereiro ela será projetada para o dia 28 (ou 29), sem transbordar para Março.

## 3. Lógica de Mini Cards (Totais)
Os totais exibidos no topo do Dashboard seguem a regra do "Teto Financeiro":
- **Total Saídas**: `MAX(saidasPagas, saidasPrevistas)`.
- **Ajustes de Conciliação**: Entradas de ajuste (`valor > 0`) somam nas receitas; saídas de ajuste (`valor < 0`) somam nas despesas.

## 4. Cálculo de Status
O status de cada item no resumo é determinado pelas regras canônicas:
- **PAGO**: `temQuitacao` OU `valorPago >= valorPrevisto`.
- **PARCIAL**: `valorPago > 0` mas `< valorPrevisto`.
- **VENCIDO**: `valorPago = 0` e `dataVencimento < hoje`.
- **VENCE HOJE / VENCE EM X DIAS**: Prazos futuros sem pagamento.

## 5. Tipos de Saldo
- **Saldo Atual**: Dinheiro realizado que entrou menos o que saiu no período.
- **Saldo Projetado**: Previsão de agendamentos pendentes (`entradasAgendadas - saidasAgendadas`).
- **Saldo Bloqueado**: Soma de aportes realizados em **Metas Ativas**.
- **Saldo Livre**: `Saldo Atual - Saldo Bloqueado`.
- **Saldo Global Histórico**: Calculado via `financeEngine.calcularTotaisHistoricosGerais(userId)` cobrindo todo o histórico desde o primeiro lançamento.

---
**Validação em Código:**
- CTE canônica central em `src/core/financeiro/canonicProjections.ts`
- Agregações em `src/core/lancamentos/resumo/repository.ts` e `src/core/relatorios/service.ts`
- Cache persistente via `withFinanceiroCache` com tag `financeiro-${userId}` em `src/core/financeiro/cache.ts`
