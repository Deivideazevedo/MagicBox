# 📘 Regras Oficiais de Negócio do Sistema MagicBox

Este documento é a referência definitiva de regras de negócio, modelagem de dados, cálculos matemáticos, projeções e arquitetura de cache do ecossistema **MagicBox**.

---

## 1. Classificação de Despesas e Comportamento de Projeção

O MagicBox categoriza as despesas em 3 tipos fundamentais:

### 1.1 Despesa FIXA (`tipo = 'FIXA'`)
* **Conceito**: Compromissos recorrentes mensais sem data final predeterminada (ex: Aluguel, Internet, Assinatura de Streaming, Academia).
* **Persistência**: Existe como um único registro mestre na tabela `despesa`. **Não gera lançamentos de parcelas futuras no banco de dados**.
* **Cálculo / Projeção**: É a **única despesa projetada virtualmente via `CROSS JOIN`** mês a mês enquanto `status = 'A'` e `deletedAt IS NULL`.
* **Regra de Coexistência**: Se o usuário lançar um pagamento ou agendamento real para essa despesa no mês $M$, o lançamento real **cala a projeção virtual** naquele mês para evitar duplicação de valores.

### 1.2 Despesa VARIÁVEL (`tipo = 'VARIAVEL'`)
* **Conceito**: Gastos ocasionais, pontuais ou de valor imprevisível (ex: Mercado, Combustível, Restaurante, Farmácia).
* **Persistência**: Registro mestre na tabela `despesa`.
* **Cálculo / Projeção**: **NUNCA é projetada virtualmente**. Só entra nos relatórios e no extrato quando houver um registro real em `lancamento` (`pagamento` ou `agendamento`).

### 1.3 DÍVIDA (`tipo = 'DIVIDA'`)
* **Conceito**: Compromissos com valor total e prazo finito de parcelas (ex: Empréstimos, Financiamentos, Compras Parceladas no Cartão).
* **Persistência**: No ato da criação (`dividasService.criar`), o sistema executa um **Bulk Insert de todas as parcelas reais na tabela `lancamento`** com `tipo = 'agendamento'` e numeração ordinal (ex: `"(01/12) - R$ 100,00"`).
* **Cálculo / Projeção**: **NUNCA deve ser projetada virtualmente com `CROSS JOIN`**. As parcelas são lidas diretamente dos lançamentos reais (`agendamento`), preservando as datas e amortizações reais cadastradas.

---

## 2. Classificação de Receitas

### 2.1 Receita FIXA (`tipo = 'FIXA'`)
* **Conceito**: Entradas financeiras mensais previsíveis (ex: Salário, Aluguel Recebido, Pró-Labore).
* **Persistência**: Registro único na tabela `receita`.
* **Cálculo**: Projetada virtualmente via `CROSS JOIN` a cada mês enquanto ativa. Se houver lançamento real no mês, a projeção virtual é calada.

### 2.2 Receita VARIÁVEL (`tipo = 'VARIAVEL'`)
* **Conceito**: Entradas esporádicas (ex: Freelance, Venda de item, Bônus).
* **Cálculo**: **NUNCA é projetada virtualmente**. Entra estritamente pelos lançamentos reais.

---

## 3. Ajustes de Conciliação Bancária e Auditoria

### 3.1 Autonomia Total
* Um ajuste de conciliação **não é uma despesa** (não foi uma compra) e **não é uma receita** (não foi um salário).
* Portanto, lançamentos de conciliação bancária são **100% autônomos**:
  * `tipo: "ajuste"`
  * `despesaId: NULL`
  * `receitaId: NULL`
  * `objetivoId: NULL`
* É expressamente proibido criar registros artificiais com `(Auto)` nas tabelas de cadastro.

### 3.2 Direção pelo Sinal do Valor
* **Ajuste de Entrada / Crédito**: `valor > 0` (ex: `+500.00`) — quando o saldo bancário real é maior que o saldo digital.
* **Ajuste de Saída / Débito**: `valor < 0` (ex: `-200.00`) — quando o saldo bancário real é menor que o saldo digital.

### 3.3 Fórmula Canônica de Saldo
$$\text{Saldo Final} = \text{Receitas Operacionais (pagas)} - \text{Despesas Operacionais (pagas)} - \text{Metas (pagas)} + \sum (\text{valor onde } tipo = \text{'ajuste'})$$

---

## 4. Regras Globais de Coexistência, Quitação e Calendário

### 4.1 Regra de Coexistência (Agendamento Cala Projeção)
Se existir qualquer lançamento real (`pagamento` ou `agendamento`) vinculado a uma despesa ou receita fixa no mês $M$, a projeção virtual daquele item para o mês $M$ é automaticamente suprimida, prevalecendo os dados do lançamento real.

### 4.2 Regra de Quitação Antecipada (`[QUITAÇÃO]`)
Quando a observação de um lançamento contém a tag `[QUITAÇÃO]`, o sistema reconhece que aquele pagamento liquidou integralmente o compromisso daquele mês, forçando `valorPrevisto = valorPago` e concluindo o status do item como **PAGO**.

### 4.3 Regra de Calendário e Meses Curtos
Para evitar datas inexistentes (como 30 ou 31 de Fevereiro), a data de vencimento virtual é truncada com segurança usando o último dia válido do mês:
$$\text{diaEfetivo} = \text{LEAST}(\text{diaVencimento}, \text{ultimo\_dia\_mes})$$

---

## 5. Arquitetura de Cache de Alta Performance (`unstable_cache`)

### 5.1 Princípio de Persistência Sem Expiração Cega
* As consultas agregadas de Resumo, Relatórios, Dashboard e Divergências utilizam `unstable_cache` do Next.js com `revalidate: false`.
* Isso armazena o resultado no Data Cache global persistente, evitando chamadas repetitivas e custosas ao banco Neon PostgreSQL.
* Tempo de resposta para consultas cacheadas: **< 10ms**.

### 5.2 Invalidação Sob Demanda por Tags
* Todos os caches de um usuário são marcados com a tag:
  $$\text{Tag} = \texttt{"financeiro-" + userId}$$
* Qualquer operação de mutação (criação, edição ou exclusão) nos módulos de `lancamentos`, `despesas`, `receitas` ou `objetivos` deve obrigatoriamente invocar:
  ```ts
  financeEngine.invalidarCache(userId);
  ```
  que executa `revalidateTag("financeiro-" + userId)`.

---

## 6. Motor Canônico (`canonicProjections.ts`)

Toda consulta analítica ou de agregação no banco de dados deve utilizar o fragmento SQL canônico centralizado em:
📂 `src/core/financeiro/sql/canonicProjections.ts`

Isso garante que **todas as telas da aplicação compartilhem a mesma fórmula matemática e nunca apresentem números divergentes**.
