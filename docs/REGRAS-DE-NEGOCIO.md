# Regras de Negócio - MagicBox

Sistema de gestão financeira pessoal com controle de despesas, receitas, lançamentos e metas.

---

## 1. Conceitual

### 1.1 Visão Geral

O MagicBox é um sistema de gestão financeira pessoal que permite aos usuários controlar suas finanças através de:

- **Categorias**: Organizam despesas e receitas
- **Despesas**: Controlam gastos fixos, variáveis e dívidas
- **Receitas**: Controlam rendas fixas e variáveis
- **Lançamentos**: Registram transações reais (pagamentos) e agendamentos
- **Metas**: Permitem poupar para objetivos específicos
- **Resumo**: Fornece visão consolidada com projeções financeiras

### 1.2 Hierarquia de Dados

```
User (Usuário)
  │
  ├── Categoria (1:N)
  │     │
  │     ├── Despesa (1:N)
  │     │     └── Lancamento (N:1)
  │     │
  │     ├── Receita (1:N)
  │     │     └── Lancamento (N:1)
  │     │
  │     └── Lancamento (N:1)
  │
  └── Meta (1:N)
        └── Lancamento (N:1)
```

### 1.3 Entidades Principais

#### 1.3.1 Categoria

**O que é:** Agrupador lógico para organizar despesas e receitas.

**Características:**
- Pertence a um único usuário
- Pode ter ícone e cor para identificação visual
- Soft delete: quando deletada, fica invisível mas recuperável
- Ao deletar uma categoria, todas as despesas/receitas vinculadas são deletadas em cascata

**Exemplo real:**
```
Categoria: "Alimentação"
  - Cor: "#FF5722"
  - Ícone: "restaurant"

Despesas vinculadas:
  - "Supermercado"
  - "Restaurante"
  - "Farmácia"
```

#### 1.3.2 Despesa

**O que é:** Representa um gasto do usuário, podendo ser recorrente ou pontual.

**Tipos de Despesa:**

| Tipo | Descrição | Projetada? | Campos Obrigatórios |
|------|-----------|------------|---------------------|
| `FIXA` | Gasto mensal fixo (aluguel, internet, etc) | ✅ Sim | `valorEstimado`, `diaVencimento` |
| `VARIAVEL` | Gasto ocasional (supermercado, lazer) | ❌ Não | Nenhum |
| `DIVIDA` | Parcelamento de compra (TV, carro, etc) | ✅ Sim (enquanto tiver saldo) | `valorTotal`, `totalParcelas`, `valorEstimado`, `diaVencimento` |

**Campos Importantes:**

- **status**: Controla se aparece nas projeções
  - `'A'` (Ativo): Aparece nas projeções e listagens
  - `'I'` (Inativo): Não aparece em nada

- **deletedAt**: Soft delete
  - `NULL`: Registro ativo e visível
  - `Data`: Registro deletado logicamente (invisível, mas recuperável)

**Exemplo real de DESPESA FIXA:**
```
Despesa: "Aluguel do Apartamento"
  - tipo: FIXA
  - valorEstimado: R$ 1.500,00
  - diaVencimento: 10
  - status: A
  - createdAt: 2024-01-01

Resultado nas projeções:
  - Janeiro: R$ 1.500,00 (projetado dia 10)
  - Fevereiro: R$ 1.500,00 (projetado dia 10)
  - Março: R$ 1.500,00 (projetado dia 10)
  - ... (todo mês)
```

**Exemplo real de DÍVIDA:**
```
Dívida: "TV LED 50 polegadas"
  - tipo: DIVIDA
  - valorTotal: R$ 3.000,00
  - valorEstimado: R$ 250,00 (parcela mensal)
  - totalParcelas: 12
  - diaVencimento: 15
  - dataInicio: 2024-01-15
  - status: A

Pagamentos feitos:
  - Jan/2024: R$ 250,00 (pagamento)
  - Fev/2024: R$ 250,00 (pagamento)

Resultado nas projeções:
  - Mar/2024: R$ 250,00 (projetado) - saldo: R$ 2.500,00
  - Abr/2024: R$ 250,00 (projetado) - saldo: R$ 2.250,00
  - Mai/2024: R$ 250,00 (projetado) - saldo: R$ 2.000,00
  - Jun/2024: R$ 250,00 (projetado) - saldo: R$ 1.750,00
  - Jul/2024: R$ 250,00 (projetado) - saldo: R$ 1.500,00
  - Ago/2024: R$ 250,00 (projetado) - saldo: R$ 1.250,00
  - Set/2024: R$ 250,00 (projetado) - saldo: R$ 1.000,00
  - Out/2024: R$ 250,00 (projetado) - saldo: R$ 750,00
  - Nov/2024: R$ 250,00 (projetado) - saldo: R$ 500,00
  - Dez/2024: R$ 250,00 (projetado) - saldo: R$ 250,00
  - Jan/2025: R$ 250,00 (projetado) - saldo: R$ 0,00 ← DÍVIDA QUITADA
  - Fev/2025: NÃO APARECE MAIS (saldo = 0)

Regra: A dívida para de ser projetada quando (valorTotal - totalPago) <= 0
```

**Exemplo real de DESPESA VARIÁVEL:**
```
Despesa: "Supermercado"
  - tipo: VARIAVEL
  - valorEstimado: NULL (não definido)
  - diaVencimento: NULL (não definido)
  - status: A

Resultado nas projeções:
  - NÃO APARECE NENHUMA PROJEÇÃO
  - Só aparece quando é criado um Lançamento manualmente
```

#### 1.3.3 Receita

**O que é:** Representa uma renda do usuário.

**Tipos de Receita:**

| Tipo | Descrição | Projetada? | Campos Obrigatórios |
|------|-----------|------------|---------------------|
| `FIXA` | Renda mensal fixa (salário, aluguel recebido) | ✅ Sim | `valorEstimado`, `diaRecebimento` |
| `VARIAVEL` | Renda ocasional (freelance, bônus) | ❌ Não | Nenhum |

**Exemplo real de RECEITA FIXA:**
```
Receita: "Salário Dev Junior"
  - tipo: FIXA
  - valorEstimado: R$ 5.000,00
  - diaRecebimento: 5
  - status: A
  - createdAt: 2024-01-01

Resultado nas projeções:
  - Janeiro: R$ 5.000,00 (projetado dia 5)
  - Fevereiro: R$ 5.000,00 (projetado dia 5)
  - Março: R$ 5.000,00 (projetado dia 5)
  - ... (todo mês)
```

#### 1.3.4 Lançamento

**O que é:** Representa uma transação financeira real ou agendada.

**Tipos de Lançamento:**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `pagamento` | Transação realizada (dinheiro saiu ou entrou) | "Paguei o aluguel", "Recebi o salário" |
| `agendamento` | Transação planejada para futuro | "Vou pagar o aluguel dia 10", "Vou receber salário dia 5" |

**Relacionamentos (XOR - Ou Exclusivo):**

Um lançamento DEVE estar vinculado a APENAS UMA das seguintes entidades:

```
Lançamento
  ├─ despesaId: número (OU)
  ├─ receitaId: número (OU)
  └─ metaId: número (OU)
      (nenhum dos três - despesa/receita/meta genérico)
```

**Regra:** Não pode ter `despesaId` E `receitaId` ao mesmo tempo.

**Suporte a Parcelas:**

O sistema suporta criar múltiplas parcelas automaticamente (1-120 parcelas).

```
Exemplo: Parcelar R$ 1.200,00 em 12x

Criação:
  Input: "TV LED", valor R$ 1.200,00, 12 parcelas, dia 15

Resultado: 12 lançamentos criados automaticamente
  - Lançamento 1: "TV LED (1/12) - R$ 100,00 (15/01)"
  - Lançamento 2: "TV LED (2/12) - R$ 100,00 (15/02)"
  - Lançamento 3: "TV LED (3/12) - R$ 100,00 (15/03)"
  - ...
  - Lançamento 12: "TV LED (12/12) - R$ 100,00 (15/12)"
```

**SEM SOFT DELETE:**

Lançamentos usam **hard delete** (exclusão real), diferente das outras entidades. Isso porque:
- Representam histórico financeiro real
- Devem ser removidos permanentemente se houver erro
- Não faz sentido "recuperar" um lançamento errado

**Filtro por Soft Delete de Relacionamentos:**

Quando um lançamento é buscado, o sistema verifica se a despesa/receita/meta relacionada ainda está ativa:

```sql
WHERE (
  (despesaId IS NOT NULL AND despesa.deletedAt IS NULL) OR
  (receitaId IS NOT NULL AND receita.deletedAt IS NULL) OR
  (metaId IS NOT NULL AND meta.deletedAt IS NULL) OR
  (despesaId IS NULL AND receitaId IS NULL AND metaId IS NULL)
)
```

#### 1.3.5 Meta

**O que é:** Objetivo de economia do usuário (poupar para um carro, viagem, emergência, etc).

**Campos Importantes:**

- **valorMeta**: Valor total que deseja economizar
- **dataAlvo**: Prazo para atingir a meta
- **status**: `'A'` (Ativo) ou `'I'` (Inativo)

**Saldo Bloqueado:**

Quando o usuário faz um lançamento vinculado a uma meta, esse valor é "bloqueado" e não aparece como disponível no saldo.

```
Meta: "Viagem para Disney"
  - valorMeta: R$ 15.000,00
  - dataAlvo: 2025-12-31
  - status: A

Lançamentos feitos:
  - Jan/2024: R$ 500,00 (aporte)
  - Fev/2024: R$ 500,00 (aporte)
  - Mar/2024: R$ 500,00 (aporte)

Resultado no resumo:
  - Saldo Atual: R$ 10.000,00 (total disponível)
  - Saldo Bloqueado: R$ 1.500,00 (em metas)
  - Saldo Livre: R$ 8.500,00 (pode gastar)
```

### 1.4 Soft Delete (Exclusão Lógica)

**Entidades com Soft Delete:**

| Entidade | Soft Delete | Recuperável |
|----------|-------------|-------------|
| Categoria | ✅ `deletedAt` | Sim |
| Despesa | ✅ `deletedAt` | Sim |
| Receita | ✅ `deletedAt` | Sim |
| Meta | ✅ `deletedAt` | Sim |
| Lançamento | ❌ Hard Delete | Não |

**Comportamento quando `deletedAt` está preenchido:**

1. **Não aparece em nenhuma listagem**
   - Queries sempre incluem `WHERE deletedAt IS NULL`
   - Usuário não vê o registro em lugar nenhum

2. **Não é projetado em resumos**
   - Despesas/Receitas deletadas não aparecem nas projeções
   - Cálculos de saldo ignoram esses registros

3. **Para recuperar: basta setar `deletedAt = NULL`**
   - O registro volta a aparecer normalmente
   - Todos os dados permanecem intactos

**Exemplo de Recuperação:**

```sql
-- Despesa foi "deletada" (soft delete)
UPDATE despesa SET deletedAt = '2024-03-15 10:30:00' WHERE id = 5;

-- Para recuperar:
UPDATE despesa SET deletedAt = NULL WHERE id = 5;
-- Resultado: A despesa volta a aparecer normalmente
```

### 1.5 Fluxo Completo: Criação até Projeção

#### Cenário Real: Usuário organza suas finanças mensais

**Passo 1: Criar Categorias**
```
Usuário cria categorias para organizar:
  - "Moradia" (casa/apartamento)
  - "Transporte" (carro, ônibus, combustível)
  - "Alimentação" (supermercado, restaurantes)
  - "Lazer" (cinema, viagens)
  - "Renda" (salário, freelance)
```

**Passo 2: Criar Despesas Recorrentes (FIXAS)**
```
Despesa 1: "Aluguel"
  - categoria: "Moradia"
  - tipo: FIXA
  - valorEstimado: R$ 1.500,00
  - diaVencimento: 10
  - status: A

Despesa 2: "Internet"
  - categoria: "Moradia"
  - tipo: FIXA
  - valorEstimado: R$ 100,00
  - diaVencimento: 15
  - status: A

Despesa 3: "Plano de Saúde"
  - categoria: "Moradia"
  - tipo: FIXA
  - valorEstimado: R$ 300,00
  - diaVencimento: 20
  - status: A
```

**Passo 3: Criar Dívida**
```
Dívida: "TV LED 50 polegadas"
  - categoria: "Lazer"
  - tipo: DIVIDA
  - valorTotal: R$ 3.000,00
  - valorEstimado: R$ 250,00 (parcela)
  - totalParcelas: 12
  - diaVencimento: 5
  - dataInicio: 2024-01-05
  - status: A
```

**Passo 4: Criar Receitas (FIXAS)**
```
Receita 1: "Salário"
  - categoria: "Renda"
  - tipo: FIXA
  - valorEstimado: R$ 5.000,00
  - diaRecebimento: 5
  - status: A

Receita 2: "Freelance"
  - categoria: "Renda"
  - tipo: VARIAVEL (não é projetado)
  - valorEstimado: NULL
  - status: A
```

**Passo 5: Registrar Pagamentos Reais (Lançamentos)**

```
Janeiro/2024:
  - Dia 5: Lançamento "Salário" → tipo: pagamento, valor: R$ 5.000,00
  - Dia 5: Lançamento "TV LED (1/12)" → tipo: pagamento, valor: R$ 250,00
  - Dia 10: Lançamento "Aluguel" → tipo: pagamento, valor: R$ 1.500,00
  - Dia 15: Lançamento "Internet" → tipo: agendamento, valor: R$ 100,00
  - Dia 20: Lançamento "Plano de Saúde" → tipo: agendamento, valor: R$ 300,00
  - Dia 28: Lançamento "Supermercado" → tipo: pagamento, valor: R$ 450,00 (despesa VARIÁVEL)
```

**Passo 6: Ver Projeções no Resumo**

```
Resumo Janeiro/2024:

┌─────────────────────────────────────────────────────────────┐
│ ENTRADAS                                                   │
├─────────────────────────────────────────────────────────────┤
│ 💰 Salário        │ Pago: R$ 5.000,00 │ Status: Pago ✓     │
│ 💰 Freelance      │ Pago: R$ 800,00   │ Status: Pago ✓     │
├─────────────────────────────────────────────────────────────┤
│ TOTAL ENTRADAS: R$ 5.800,00                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SAÍDAS                                                      │
├─────────────────────────────────────────────────────────────┤
│ 💸 Aluguel         │ Pago: R$ 1.500,00 │ Status: Pago ✓     │
│ 💸 TV LED (1/12)   │ Pago: R$ 250,00   │ Status: Pago ✓     │
│ 💸 Internet        │ Agendado: R$ 100  │ Vence em 15 dias   │
│ 💸 Plano de Saúde  │ Agendado: R$ 300  │ Vence em 20 dias   │
│ 💸 Supermercado    │ Pago: R$ 450,00   │ Status: Pago ✓     │
├─────────────────────────────────────────────────────────────┤
│ TOTAL SAÍDAS: R$ 2.600,00                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SALDOS                                                      │
├─────────────────────────────────────────────────────────────┤
│ Saldo Atual:     R$ 3.200,00 (5.800 - 2.600)                │
│ Saldo Projetado: R$ 2.800,00 (5.800 - 3.000)               │
│ Saldo Livre:     R$ 3.200,00 (sem metas ativas)             │
└─────────────────────────────────────────────────────────────┘

PROJEÇÃO FEVEREIRO/2024:
┌─────────────────────────────────────────────────────────────┐
│ 💰 Salário        │ Projetado: R$ 5.000,00 │ Dia 5          │
│ 💸 Aluguel        │ Projetado: R$ 1.500,00 │ Dia 10         │
│ 💸 TV LED (2/12)  │ Projetado: R$ 250,00  │ Dia 5          │
│ 💸 Internet       │ Projetado: R$ 100,00  │ Dia 15         │
│ 💸 Plano de Saúde  │ Projetado: R$ 300,00  │ Dia 20          │
└─────────────────────────────────────────────────────────────┘
```

### 1.6 Regras de Negócio Detalhadas

#### 1.6.1 Regras de Projeção

**Quando uma DESPESA aparece nas projeções:**

✅ Todos os requisitos devem ser verdadeiros:
1. `status = 'A'` (Ativo)
2. `deletedAt IS NULL`
3. Mês de referência >= mês de criação da despesa
4. Para tipo `DIVIDA`: `(valorTotal - totalPago) > 0`

❌ Se qualquer um for falso, NÃO aparece:
1. `status = 'I'` (Inativo) → Não aparece
2. `deletedAt` preenchido → Não aparece
3. Mês < criação → Não aparece (despesa ainda não existia)
4. Dívida quitada → Não aparece mais

**Quando uma RECEITA aparece nas projeções:**

✅ Todos os requisitos devem ser verdadeiros:
1. `tipo = 'FIXA'`
2. `status = 'A'`
3. `deletedAt IS NULL`
4. Mês de referência >= mês de criação

❌ Receitas `VARIAVEL` NUNCA são projetadas automaticamente

#### 1.6.2 Regras de Status

O sistema calcula o status de cada item no resumo:

```typescript
// Pseudocódigo da lógica
function calcularStatus(valorPago, valorPrevisto, diaVencimento, mes, ano) {
  
  // Regra 1: Já foi pago total ou parcialmente
  if (valorPago > 0) {
    if (valorPago < valorPrevisto) {
      return "Parcial" // Pagou algo, mas não tudo
    }
    return "Pago" // Pagou o valor completo
  }
  
  // Regra 2: Sem dia de vencimento
  if (diaVencimento === null) {
    return "" // Sem status
  }
  
  // Regra 3: Data de vencimento
  dataVencimento = new Date(ano, mes - 1, diaVencimento)
  
  if (dataVencimento < hoje) {
    diasAtraso = hoje - dataVencimento
    return `Vencido há ${diasAtraso} dia(s)`
  }
  
  if (dataVencimento === hoje) {
    return "Vence hoje"
  }
  
  diasParaVencer = dataVencimento - hoje
  return `Vence em ${diasParaVencer} dia(s)`
}
```

#### 1.6.3 Regras de Cálculo de Saldo

**Saldo Atual:**
```
saldoAtual = entradasPagas - saidasPagas
```

**Saldo Projetado:**
```
saldoProjetado = entradasPrevistas - saidasPrevistas
```

Onde:
```
entradasPrevistas = entradasPagas + entradasAgendadas + entradasProjetadas
saidasPrevistas = saidasPagas + saidasAgendadas + saidasProjetadas
```

**Saldo Bloqueado:**
```
saldoBloqueado = soma de todos lançamentos vinculados a metas ATIVAS
```

**Saldo Livre:**
```
saldoLivre = saldoAtual - saldoBloqueado
```

---

## 2. Exemplos Práticos (SQL das Projeções)

### 2.1 Estrutura Base: CTE `meses_do_periodo`

Esta CTE gera todos os meses do período selecionado usando `generate_series`:

```sql
WITH meses_do_periodo AS (
  SELECT 
    mes_referencia::date,
    EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
  FROM generate_series(
    date_trunc('month', '2024-01-01'::date),
    date_trunc('month', '2024-06-01'::date),
    '1 month'::interval
  ) as mes_referencia
)

-- Resultado:
-- mes_referencia  | ultimo_dia_mes
-- ----------------|---------------
-- 2024-01-01      | 31
-- 2024-02-01      | 29
-- 2024-03-01      | 31
-- 2024-04-01      | 30
-- 2024-05-01      | 31
-- 2024-06-01      | 30
```

### 2.2 Projeção de Despesas FIXAS

```sql
-- Exemplo: Projetar "Aluguel" de R$ 1.500,00 no dia 10

WITH meses_do_periodo AS (...) -- conforme acima

SELECT 
  d.id as "origemId",
  'despesa' as "origem",
  d.nome,
  d."valorEstimado" as "valorPrevisto",
  d."diaVencimento" as "diaVencido",
  EXTRACT(MONTH FROM m.mes_referencia) as "mes",
  EXTRACT(YEAR FROM m.mes_referencia) as "ano",
  (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
FROM despesa d
CROSS JOIN meses_do_periodo m
WHERE d."userId" = 1 
  AND d.status = 'A' 
  AND d.tipo = 'FIXA' 
  AND d."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', d."createdAt")

-- Resultado:
-- origemId | origem   | nome      | valorPrevisto | diaVencido | mes  | ano  | data_referencia
-- ---------|----------|-----------|---------------|------------|------|------|----------------
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 1    | 2024 | 2024-01-10
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 2    | 2024 | 2024-02-10
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 3    | 2024 | 2024-03-10
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 4    | 2024 | 2024-04-10
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 5    | 2024 | 2024-05-10
-- 1        | despesa  | Aluguel   | 1500.00       | 10         | 6    | 2024 | 2024-06-10
```

### 2.3 Projeção de DÍVIDAS (Com Amortização)

```sql
-- Exemplo: Dívida de TV LED
-- valorTotal: R$ 3.000,00
-- valorEstimado (parcela): R$ 250,00
-- totalParcelas: 12
-- dataInicio: 2024-01-05
-- Já pagos: R$ 500,00 (2 parcelas)

-- CTE para calcular saldos pagos por dívida
WITH saldos_devedores AS (
  SELECT 
    "despesaId",
    SUM(valor) as total_pago
  FROM lancamento
  WHERE "userId" = 1 
    AND tipo = 'pagamento' 
    AND "despesaId" IS NOT NULL
  GROUP BY "despesaId"
),
meses_do_periodo AS (...) -- conforme acima

SELECT 
  d.id as "origemId",
  'despesa' as "origem",
  d.nome,
  d."valorEstimado" as "valorPrevisto",
  d."diaVencimento" as "diaVencido",
  EXTRACT(MONTH FROM m.mes_referencia) as "mes",
  EXTRACT(YEAR FROM m.mes_referencia) as "ano",
  (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) as "saldoRestante"
FROM despesa d
LEFT JOIN saldos_devedores s ON s."despesaId" = d.id
CROSS JOIN meses_do_periodo m
WHERE d."userId" = 1 
  AND d.status = 'A' 
  AND d.tipo = 'DIVIDA' 
  AND d."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', COALESCE(d."dataInicio", d."createdAt"))
  -- CRÍTICO: Só projeta se ainda tiver saldo devedor
  AND (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) > 0

-- Resultado (após pagar 2 parcelas):
-- origemId | nome    | valorPrevisto | mes  | ano  | saldoRestante
-- ---------|---------|---------------|------|------|-------------
-- 2        | TV LED  | 250.00        | 3    | 2024 | 2500.00  ← ainda aparece
-- 2        | TV LED  | 250.00        | 4    | 2024 | 2250.00  ← ainda aparece
-- 2        | TV LED  | 250.00        | 5    | 2024 | 2000.00  ← ainda aparece
-- 2        | TV LED  | 250.00        | 6    | 2024 | 1750.00  ← ainda aparece
-- ... (continua até saldo = 0)

-- Resultado (após pagar todas as 12 parcelas):
-- NENHUMA LINHA RETORNADA (saldoRestante = 0, não satisfaz > 0)
```

### 2.4 Projeção de Receitas FIXAS

```sql
-- Exemplo: Salário de R$ 5.000,00 no dia 5

WITH meses_do_periodo AS (...) -- conforme acima

SELECT 
  f.id as "origemId",
  'receita' as "origem",
  f.nome,
  f."valorEstimado" as "valorPrevisto",
  f."diaRecebimento" as "diaVencido",
  EXTRACT(MONTH FROM m.mes_referencia) as "mes",
  EXTRACT(YEAR FROM m.mes_referencia) as "ano",
  f.icone,
  f.cor
FROM receita f
CROSS JOIN meses_do_periodo m
WHERE f."userId" = 1 
  AND f.status = 'A' 
  AND f.tipo = 'FIXA' 
  AND f."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', f."createdAt")

-- Resultado:
-- origemId | origem  | nome     | valorPrevisto | diaVencido | mes  | ano  | icone | cor
-- ---------|---------|----------|---------------|------------|------|------|-------|-----
-- 1        | receita | Salário  | 5000.00       | 5          | 1    | 2024 | money | green
-- 1        | receita | Salário  | 5000.00       | 5          | 2    | 2024 | money | green
-- 1        | receita | Salário  | 5000.00       | 5          | 3    | 2024 | money | green
-- 1        | receita | Salário  | 5000.00       | 5          | 4    | 2024 | money | green
-- 1        | receita | Salário  | 5000.00       | 5          | 5    | 2024 | money | green
-- 1        | receita | Salário  | 5000.00       | 5          | 6    | 2024 | money | green
```

### 2.5 União Completa: Projeções + Realizado

Este é o coração do sistema de resumo, unindo projeções automáticas com lançamentos reais:

```sql
WITH meses_do_periodo AS (...),
saldos_devedores AS (...),
itens_recorrentes_base AS (
  -- DESPESAS FIXAS
  SELECT d.id as "origemId", 'despesa' as "origem", d.nome, 
         d."valorEstimado" as "valorPrevisto", d."diaVencimento" as "diaVencido",
         EXTRACT(MONTH FROM m.mes_referencia) as "mes",
         EXTRACT(YEAR FROM m.mes_referencia) as "ano",
         d.icone, d.cor
  FROM despesa d
  CROSS JOIN meses_do_periodo m
  WHERE d."userId" = 1 AND d.status = 'A' AND d.tipo = 'FIXA' AND d."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', d."createdAt")
  
  UNION ALL
  
  -- DÍVIDAS
  SELECT d.id, 'despesa', d.nome, d."valorEstimado", d."diaVencimento",
         EXTRACT(MONTH FROM m.mes_referencia), EXTRACT(YEAR FROM m.mes_referencia),
         d.icone, d.cor
  FROM despesa d
  LEFT JOIN saldos_devedores s ON s."despesaId" = d.id
  CROSS JOIN meses_do_periodo m
  WHERE d."userId" = 1 AND d.status = 'A' AND d.tipo = 'DIVIDA' AND d."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', COALESCE(d."dataInicio", d."createdAt"))
  AND (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) > 0
  
  UNION ALL
  
  -- RECEITAS FIXAS
  SELECT f.id, 'receita', f.nome, f."valorEstimado", f."diaRecebimento",
         EXTRACT(MONTH FROM m.mes_referencia), EXTRACT(YEAR FROM m.mes_referencia),
         f.icone, f.cor
  FROM receita f
  CROSS JOIN meses_do_periodo m
  WHERE f."userId" = 1 AND f.status = 'A' AND f.tipo = 'FIXA' AND f."deletedAt" IS NULL
  AND m.mes_referencia >= date_trunc('month', f."createdAt")
),
lancamentos_reais_agrupados AS (
  -- Aqui agrupamos os lançamentos REALMENTE feitos pelo usuário
  SELECT
    COALESCE(l."receitaId", l."despesaId") as "origemId",
    CASE WHEN l."receitaId" IS NOT NULL THEN 'receita' ELSE 'despesa' END as "origem",
    EXTRACT(MONTH FROM l.data) as "mes",
    EXTRACT(YEAR FROM l.data) as "ano",
    SUM(CASE WHEN l.tipo = 'agendamento' THEN valor ELSE 0 END) as "valorPrevisto",
    SUM(CASE WHEN l.tipo = 'pagamento' THEN valor ELSE 0 END) as "valorPago"
  FROM lancamento l
  LEFT JOIN despesa d ON l."despesaId" = d.id
  LEFT JOIN receita r ON l."receitaId" = r.id
  WHERE l."userId" = 1 
    AND l.data >= '2024-01-01' AND l.data <= '2024-06-30'
    AND (
      (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
      (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
      (l."despesaId" IS NULL AND l."receitaId" IS NULL)
    )
  GROUP BY 1, 2, 3, 4
),
uniao_de_dados AS (
  -- FULL OUTER JOIN: junta projeções com realizado
  SELECT 
    COALESCE(real."origemId", rec."origemId") as "origemId",
    COALESCE(real."origem", rec."origem") as "origem",
    COALESCE(real."mes", rec."mes") as "mes",
    COALESCE(real."ano", rec."ano") as "ano",
    COALESCE(rec."valorPrevisto", real."valorPrevisto") as "valorPrevisto",
    COALESCE(real."valorPago", 0) as "valorPago",
    COALESCE(rec.nome, d.nome, f.nome) as "nome",
    COALESCE(rec."diaVencido", d."diaVencimento", f."diaRecebimento") as "diaVencido",
    COALESCE(rec.icone, d.icone, f.icone) as "icone",
    COALESCE(rec.cor, d.cor, f.cor) as "cor"
  FROM itens_recorrentes_base rec
  FULL OUTER JOIN lancamentos_reais_agrupados real 
    ON rec."origemId" = real."origemId" AND rec."origem" = real."origem" 
    AND rec."mes" = real."mes" AND rec."ano" = real."ano"
  LEFT JOIN despesa d ON real."origemId" = d.id AND real."origem" = 'despesa'
  LEFT JOIN receita f ON real."origemId" = f.id AND real."origem" = 'receita'
)
SELECT * FROM uniao_de_dados ORDER BY "ano", "mes", "nome"

-- Resultado hipotético (Janeiro/2024):
-- origemId | origem  | mes | ano | valorPrevisto | valorPago | nome     | diaVencido | status
-- ---------|---------|-----|-----|---------------|-----------|----------|------------|--------
-- 1        | receita | 1   | 2024| 5000.00       | 5000.00   | Salário  | 5          | Pago ✓
-- 2        | despesa | 1   | 2024| 1500.00       | 1500.00   | Aluguel  | 10         | Pago ✓
-- 3        | despesa | 1   | 2024| 250.00        | 250.00    | TV LED   | 5          | Pago ✓
-- 4        | despesa | 1   | 2024| 100.00        | 0.00      | Internet | 15         | Vence em 10 dias
```

### 2.6 Cálculo de Saldo Bloqueado em Metas

```sql
-- Saldo bloqueado = soma de todos aportes em metas ativas

WITH metas_ativas AS (
  SELECT 
    COALESCE(SUM(l.valor), 0) as saldo_bloqueado 
  FROM lancamento l
  INNER JOIN meta m ON l."metaId" = m.id
  WHERE m."userId" = 1 
    AND m.status = 'A' 
    AND m."deletedAt" IS NULL
    AND l.tipo = 'pagamento'
)
SELECT * FROM metas_ativas

-- Resultado:
-- saldo_bloqueado
-- ---------------
-- 1500.00
```

### 2.7 Verificação: Itens Recorrentes Faltantes

Este query mostra quais recorrências ainda não foram registradas como lançamento:

```sql
-- Quero saber: quais despesas fixas ainda não têm lançamento esse mês?

WITH recorrencias_faltantes AS (
  -- DESPESAS FIXAS sem agendamento
  SELECT d.id, d.nome, d."valorEstimado" as valor, 'despesa' as origem
  FROM despesa d
  CROSS JOIN meses_do_periodo m
  WHERE d."userId" = 1 
    AND d.status = 'A' 
    AND d.tipo = 'FIXA'
    AND d."deletedAt" IS NULL
    AND m.mes_referencia >= date_trunc('month', d."createdAt")
    AND NOT EXISTS (
      -- Verifica se já existe lançamento agendado para esse mês
      SELECT 1 FROM lancamento l 
      WHERE l."despesaId" = d.id 
        AND l.tipo = 'agendamento'
        AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
        AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
        AND l."userId" = 1
    )
)
SELECT * FROM recorrencias_faltantes

-- Resultado:
-- id | nome       | valor   | origem
-- ---|------------|---------|--------
-- 4  | Internet   | 100.00  | despesa
```

---

## 3. Diagramas de Fluxo

### 3.1 Diagrama ER (Entidade-Relacionamento)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                        │
│  ┌─────────────┬──────────────────────────────────────────────────┐    │
│  │ id          │ Int (PK, Autoincrement)                           │    │
│  │ username    │ String                                            │    │
│  │ email       │ String (Unique)                                   │    │
│  │ role        │ String (ADMIN, USER, etc)                        │    │
│  │ status      │ String (A=Ativo, I=Inativo)                      │    │
│  │ deletedAt   │ DateTime? (Soft Delete)                          │    │
│  │ createdAt   │ DateTime                                          │    │
│  │ updatedAt   │ DateTime                                          │    │
│  └─────────────┴──────────────────────────────────────────────────┘    │
│                                    │                                     │
│          ┌─────────────────────────┼─────────────────────────┐        │
│          │                         │                         │        │
│          ▼                         ▼                         ▼        │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐│
│  │  CATEGORIA    │         │     META       │         │  CATEGORIA    ││
│  │  (Despesas)   │         │               │         │  (Receitas)   ││
│  ├───────────────┤         ├───────────────┤         ├───────────────┤│
│  │ id (PK)       │         │ id (PK)       │         │ id (PK)       ││
│  │ nome          │         │ nome          │         │ nome          ││
│  │ descricao     │         │ valorMeta      │         │ descricao     ││
│  │ icone         │         │ dataAlvo       │         │ icone         ││
│  │ cor           │         │ status         │         │ cor           ││
│  │ userId (FK)   │         │ userId (FK)    │         │ userId (FK)   ││
│  │ deletedAt     │         │ deletedAt      │         │ deletedAt     ││
│  │ createdAt     │         │ createdAt      │         │ createdAt     ││
│  │ updatedAt     │         │ updatedAt      │         │ updatedAt     ││
│  └───────────────┘         └───────────────┘         └───────────────┘│
│          │                         │                         │         │
│          │                         │                         │         │
│          ▼                         │                         ▼         │
│  ┌───────────────┐                 │                 ┌───────────────┐│
│  │   DESPESA     │                 │                 │   RECEITA     ││
│  ├───────────────┤                 │                 ├───────────────┤│
│  │ id (PK)       │                 │                 │ id (PK)       ││
│  │ nome          │                 │                 │ nome          ││
│  │ tipo          │                 │                 │ tipo          ││
│  │ valorEstimado │                 │                 │ valorEstimado ││
│  │ valorTotal    │                 │                 │ diaRecebimento││
│  │ totalParcelas │                 │                 │ status        ││
│  │ diaVencimento │                 │                 │ deletedAt     ││
│  │ dataInicio    │                 │                 │ createdAt     ││
│  │ status        │                 │                 │ updatedAt     ││
│  │ userId (FK)   │                 │                 │ userId (FK)   ││
│  │ categoriaId   │                 │                 │ categoriaId   ││
│  │ deletedAt     │                 │                 │ deletedAt     ││
│  │ icone         │                 │                 │ icone         ││
│  │ cor           │                 │                 │ cor           ││
│  │ createdAt     │                 │                 └───────────────┘│
│  │ updatedAt     │                 │                           │       │
│  └───────────────┘                 │                           │       │
│          │                         │                           │       │
│          └─────────────────────────┼───────────────────────────┘       │
│                                    │                                     │
│                                    ▼                                     │
│                         ┌─────────────────┐                            │
│                         │   LANCAMENTO    │                            │
│                         ├─────────────────┤                            │
│                         │ id (PK)         │                            │
│                         │ tipo            │                            │
│                         │ valor           │                            │
│                         │ data            │                            │
│                         │ observacao      │                            │
│                         │ despesaId (FK?) │                            │
│                         │ receitaId (FK?) │                            │
│                         │ metaId (FK?)    │                            │
│                         │ userId (FK)     │                            │
│                         │ categoriaId (FK)│                           │
│                         │ createdAt       │                            │
│                         │ updatedAt       │                            │
│                         └─────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

LEGENDA:
- PK: Primary Key
- FK: Foreign Key
- ?: Campo opcional (pode ser NULL)
- Soft Delete: deletedAt (usado em todas entidades exceto Lancamento)
```

### 3.2 Fluxo: Categoria → Despesa → Lançamento → Resumo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE DADOS                                  │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   CRIAR USUÁRIO   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ CRIA CATEGORIAS  │
                    │  - Moradia       │
                    │  - Transporte    │
                    │  - Alimentação   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ CRIA DESPESAS│  │CRIA RECEITAS │  │  CRIA METAS  │
   ├──────────────┤  ├──────────────┤  ├──────────────┤
   │ FIXA         │  │ FIXA         │  │ Viagem       │
   │ - Aluguel    │  │ - Salário    │  │ - R$ 15.000  │
   │ - Internet   │  │ - Freelance  │  │ - Dez/2025   │
   │              │  │              │  │              │
   │ VARIAVEL     │  │ VARIAVEL     │  │              │
   │ - Supermercado│ │ - Bônus      │  │              │
   │              │  │              │  │              │
   │ DIVIDA       │  └──────────────┘  └──────────────┘
   │ - TV LED     │          │                 │
   │ - R$ 3.000   │          │                 │
   │ - 12x R$250  │          │                 │
   └──────────────┘          │                 │
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │    REGISTRA PAGAMENTOS  │
               │    (LANÇAMENTOS)        │
               ├────────────────────────┤
               │ Tipo: PAGAMENTO         │
               │ - Aluguel: R$ 1.500     │
               │ - Salário: R$ 5.000     │
               │ - TV LED: R$ 250        │
               │ - Supermercado: R$ 450   │
               │                          │
               │ Tipo: AGENDAMENTO       │
               │ - Internet: R$ 100       │
               │ - Plano Saúde: R$ 300    │
               │                          │
               │ Vinculados a Meta:      │
               │ - Aporte Viagem: R$ 500  │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │    CONSULTA RESUMO      │
               │    (PROJEÇÕES)          │
               ├────────────────────────┤
               │                         │
               │ PROJEÇÕES AUTO:         │
               │ - Salário (todo dia 5) │
               │ - Aluguel (todo dia 10) │
               │ - TV LED (enq. saldo>0) │
               │                         │
               │ NÃO PROJETADO:          │
               │ - Supermercado (VARIAVEL)│
               │ - Freelance (VARIAVEL)  │
               │                         │
               │ CÁLCULOS:               │
               │ - Saldo Atual          │
               │ - Saldo Projetado       │
               │ - Saldo Bloqueado       │
               │ - Saldo Livre           │
               │                         │
               └────────────────────────┘
```

### 3.3 Fluxo de Soft Delete

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SOFT DELETE                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  USUÁRIO CLICA EM "DELETAR"                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  Qual entidade está sendo     │
                    │  deletada?                    │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
  │ CATEGORIA    │           │ DESPESA     │           │ RECEITA     │
  │ou META       │           │ou DIVIDA    │           │ou VARIÁVEL  │
  └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PASSO 1: SETA deletedAt = NOW()                                        │
│                                                                         │
│  UPDATE categoria SET deletedAt = '2024-03-15 10:30:00' WHERE id = 5;   │
│  UPDATE despesa SET deletedAt = '2024-03-15 10:30:00' WHERE id = 8;     │
│  UPDATE receita SET deletedAt = '2024-03-15 10:30:00' WHERE id = 3;     │
│  UPDATE meta SET deletedAt = '2024-03-15 10:30:00' WHERE id = 2;        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CONSEQUÊNCIAS IMEDIATAS:                                               │
│                                                                         │
│  ❌ Não aparece em nenhuma listagem                                     │
│     → Queries: WHERE deletedAt IS NULL                                  │
│                                                                         │
│  ❌ Não aparece nas projeções do resumo                                 │
│     → Filtrado na query SQL                                             │
│                                                                         │
│  ❌ Não afetado em cálculos de saldo                                    │
│     → Ignorado em todos os aggregations                                 │
│                                                                         │
│  ⚠️  Lançamentos vinculados:                                            │
│     → Ficam órfãos (perdem referência)                                  │
│     → Mostram como "sem categoria" no frontend                          │
│                                                                         │
│  ⚠️  Em DIVIDA:                                                         │
│     → Não é mais projetada                                              │
│     → Saldo devedor continua existindo                                  │
│     → Pode ser quitado via lançamentos existentes                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  RECUPERAÇÃO (se necessário):                                           │
│                                                                         │
│  UPDATE despesa SET deletedAt = NULL WHERE id = 8;                       │
│                                                                         │
│  Resultado:                                                             │
│  ✅ Volta a aparecer nas listagens                                      │
│  ✅ Volta a ser projetada no resumo                                     │
│  ✅ Todos os lançamentos vinculados voltam a aparecer corretamente      │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                           TABELA DE REFERÊNCIA
═══════════════════════════════════════════════════════════════════════════

  Entidade         │ Soft Delete? │ Recuperável? │ Comportamento quando deletado
  ─────────────────┼──────────────┼──────────────┼────────────────────────────────
  Categoria        │     ✅       │     Sim      │ - Invisível em todas listagens
                   │              │              │ - Despesas/Receitas vinculadas
                   │              │              │   ficam órfãs
                   │              │              │ - Recuperar: SET deletedAt=NULL
  ─────────────────┼──────────────┼──────────────┼────────────────────────────────
  Despesa          │     ✅       │     Sim      │ - Para de ser projetada
  (inclui DÍVIDA)  │              │              │ - Lançamentos ficam órfãos
                   │              │              │ - Saldo devedor permanece
                   │              │              │ - Recuperar: SET deletedAt=NULL
  ─────────────────┼──────────────┼──────────────┼────────────────────────────────
  Receita          │     ✅       │     Sim      │ - Para de ser projetada
                   │              │              │ - Lançamentos ficam órfãos
                   │              │              │ - Recuperar: SET deletedAt=NULL
  ─────────────────┼──────────────┼──────────────┼────────────────────────────────
  Meta             │     ✅       │     Sim      │ - Saldo deixa de ser bloqueado
                   │              │              │ - Lançamentos ficam órfãos
                   │              │              │ - Recuperar: SET deletedAt=NULL
  ─────────────────┼──────────────┼──────────────┼────────────────────────────────
  Lançamento       │     ❌       │     Não      │ - Excluído permanentemente
                   │              │              │ - Sem volta
                   │              │              │ - Hard delete (DELETE FROM)

═══════════════════════════════════════════════════════════════════════════
```

### 3.4 Fluxo de Cálculo de Status

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE STATUS                                    │
│         (Como o sistema determina se está Pago, Vencido, etc)          │
└─────────────────────────────────────────────────────────────────────────┘

ENTRADA:
  - valorPago: número (quanto foi pago)
  - valorPrevisto: número (quanto era esperado)
  - diaVencimento: número (dia do mês)
  - mes: número (mês de referência)
  - ano: número (ano de referência)

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     INÍCIO DO ALGORITMO                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                   │
│                                    ▼                                   │
│                    ┌───────────────────────────────┐                   │
│                    │ valorPago > 0 E               │                   │
│                    │ valorPrevisto !== 0?         │                   │
│                    └───────────────┬───────────────┘                   │
│                                    │                                   │
│                         ┌──────────┴──────────┐                        │
│                         │                     │                        │
│                         ▼                     ▼                        │
│               ┌─────────────────┐   ┌─────────────────┐               │
│               │     SIM         │   │     NÃO         │               │
│               └────────┬────────┘   └────────┬────────┘               │
│                        │                     │                        │
│                        ▼                     │                        │
│            ┌───────────────────┐             │                        │
│            │ valorPago <        │             │                        │
│            │ valorPrevisto?     │             │                        │
│            └────────┬───────────┘             │                        │
│                     │                         │                        │
│          ┌──────────┴──────────┐              │                        │
│          │                     │              │                        │
│          ▼                     ▼              │                        │
│   ┌────────────┐       ┌────────────┐         │                        │
│   │   SIM      │       │   NÃO     │         │                        │
│   │            │       │            │         │                        │
│   │ "Parcial"  │       │   "Pago"   │         │                        │
│   │ isAtrasado │       │ isAtrasado│         │                        │
│   │ = false    │       │ = false   │         │                        │
│   └────────────┘       └────────────┘         │                        │
│                                               │                        │
│                                               ▼                        │
│                                 ┌───────────────────────────┐           │
│                                 │ diaVencimento é NULL ou  │           │
│                                 │ diaVencimento é undefined?│          │
│                                 └────────────┬────────────┘           │
│                                              │                        │
│                                   ┌───────────┴───────────┐            │
│                                   │                       │            │
│                                   ▼                       ▼            │
│                           ┌────────────┐           ┌────────────┐       │
│                           │    SIM     │           │    NÃO     │       │
│                           └─────┬──────┘           └─────┬──────┘       │
│                                 │                       │              │
│                                 ▼                       │              │
│                      ┌───────────────────┐              │              │
│                      │ Retorna:          │              │              │
│                      │ {                 │              │              │
│                      │   label: "",      │              │              │
│                      │   isAtrasado: false│             │              │
│                      │ }                 │              │              │
│                      └───────────────────┘              │              │
│                                                         ▼              │
│                                           ┌─────────────────────────┐   │
│                                           │ Monta dataVencimento:  │   │
│                                           │ new Date(ano, mes-1,   │   │
│                                           │       diaVencimento)   │   │
│                                           └───────────┬─────────────┘   │
│                                                       │                 │
│                                                       ▼                 │
│                                         ┌─────────────────────────┐     │
│                                         │ dataVencimento < hoje? │     │
│                                         └───────────┬─────────────┘     │
│                                                     │                   │
│                                          ┌──────────┴──────────┐        │
│                                          │                     │        │
│                                          ▼                     ▼        │
│                                   ┌────────────┐       ┌────────────┐    │
│                                   │    SIM     │       │    NÃO     │    │
│                                   └─────┬──────┘       └─────┬──────┘    │
│                                         │                     │         │
│                                         ▼                     │         │
│                              ┌────────────────────┐           │         │
│                              │ diasAtraso =       │           │         │
│                              │ hoje - vencimento │           │         │
│                              │ (em dias)         │           │         │
│                              └─────────┬──────────┘           │         │
│                                        │                     │         │
│                                        ▼                     │         │
│                              ┌────────────────────┐           │         │
│                              │ "Vencido há X dias"│          │         │
│                              │ isAtrasado = true │           │         │
│                              └────────────────────┘           │         │
│                                                             │         │
│                                                             ▼         │
│                                                   ┌─────────────────┐  │
│                                                   │ diasParaVencer =│  │
│                                                   │ vencimento -    │  │
│                                                   │ hoje (em dias) │  │
│                                                   └────────┬────────┘  │
│                                                            │            │
│                                                   ┌─────────┴────────┐ │
│                                                   │ diasParaVencer   │ │
│                                                   │ == 0?            │ │
│                                                   └────────┬─────────┘ │
│                                                            │           │
│                                                 ┌──────────┴─────────┐ │
│                                                 │                    │  │
│                                                 ▼                    ▼ │
│                                          ┌────────────┐      ┌────────────┐│
│                                          │   SIM      │      │   NÃO     ││
│                                          └─────┬──────┘      └─────┬──────┘│
│                                                │                    │     │
│                                                ▼                    │     │
│                                     ┌─────────────────────┐        │     │
│                                     │ "Vence hoje"        │        │     │
│                                     │ isAtrasado = false  │        │     │
│                                     └─────────────────────┘        │     │
│                                                                  │     │
│                                                                  ▼     │
│                                                       ┌─────────────────────┐│
│                                                       │ "Vence em X dias"   ││
│                                                       │ isAtrasado = false  ││
│                                                       └─────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                           EXEMPLOS PRÁTICOS
═══════════════════════════════════════════════════════════════════════════

CASO 1: Pagou menos do que o previsto (Parcial)
──────────────────────────────────────────────
  Input:  valorPago=800, valorPrevisto=1500, diaVencimento=10, mes=1, ano=2024
  Output: { label: "Parcial", isAtrasado: false }

CASO 2: Pagou exatamente o previsto (Pago)
──────────────────────────────────────────────
  Input:  valorPago=1500, valorPrevisto=1500, diaVencimento=10, mes=1, ano=2024
  Output: { label: "Pago", isAtrasado: false }

CASO 3: Venceu há 5 dias (Vencido)
──────────────────────────────────────────────
  Input:  valorPago=0, valorPrevisto=1500, diaVencimento=10, mes=1, ano=2024
          (considerando hoje = 15/01/2024)
  Output: { label: "Vencido há 5 dias", isAtrasado: true }

CASO 4: Vence hoje
──────────────────────────────────────────────
  Input:  valorPago=0, valorPrevisto=1500, diaVencimento=10, mes=1, ano=2024
          (considerando hoje = 10/01/2024)
  Output: { label: "Vence hoje", isAtrasado: false }

CASO 5: Vence em 7 dias (Futuro)
──────────────────────────────────────────────
  Input:  valorPago=0, valorPrevisto=1500, diaVencimento=10, mes=1, ano=2024
          (considerando hoje = 03/01/2024)
  Output: { label: "Vence em 7 dias", isAtrasado: false }

CASO 6: Sem dia de vencimento definido
──────────────────────────────────────────────
  Input:  valorPago=0, valorPrevisto=0, diaVencimento=null, mes=1, ano=2024
  Output: { label: "", isAtrasado: false }

═══════════════════════════════════════════════════════════════════════════
```

### 3.5 Fluxo: Cálculo de Saldos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE SALDOS                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  DADOS DE ENTRADA:                                                      │
│                                                                         │
│  Entradas Pagas:        R$ 5.000,00  (salário recebido)                 │
│  Entradas Agendadas:   R$ 0,00      (nenhuma receita agendada)         │
│  Entradas Projetadas:  R$ 0,00      (receitas fixas sem lançamento)   │
│                                                                         │
│  Saídas Pagas:         R$ 2.200,00  (aluguel+internet+tv+picole)       │
│  Saídas Agendadas:     R$ 300,00    (plano de saúde agendado)          │
│  Saídas Projetadas:    R$ 0,00      (despesas fixas sem lançamento)  │
│                                                                         │
│  Saldo Bloqueado:      R$ 500,00    (aportes na meta "Viagem")         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  1. ENTRADAS PREVISTAS                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  entradasPrevistas = entradasPagas + entradasAgendadas +          │  │
│  │                        entradasProjetadas                          │  │
│  │                                                                     │  │
│  │  entradasPrevistas = 5.000 + 0 + 0                                 │  │
│  │  entradasPrevistas = R$ 5.000,00                                    │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  2. SAÍDAS PREVISTAS                                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  saidasPrevistas = saidasPagas + saidasAgendadas + saidasProjetadas  │  │
│  │                                                                     │  │
│  │  saidasPrevistas = 2.200 + 300 + 0                                  │  │
│  │  saidasPrevistas = R$ 2.500,00                                      │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  3. SALDO ATUAL (Dinheiro Real)                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  saldoAtual = entradasPagas - saidasPagas                          │  │
│  │                                                                     │  │
│  │  saldoAtual = 5.000 - 2.200                                        │  │
│  │  saldoAtual = R$ 2.800,00                                          │  │
│  │                                                                     │  │
│  │  Este é o dinheiro que JÁ SAIU ou JÁ ENTROU da conta.              │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  4. SALDO PROJETADO (Expectativa)                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  saldoProjetado = entradasPrevistas - saidasPrevistas               │  │
│  │                                                                     │  │
│  │  saldoProjetado = 5.000 - 2.500                                    │  │
│  │  saldoProjetado = R$ 2.500,00                                      │  │
│  │                                                                     │  │
│  │  Este é o SALDO EXPECTATIVO considerando tudo que já              │  │
│  │  aconteceu + o que está agendado/projetado.                         │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  5. SALDO BLOQUEADO (Reservado para Metas)                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  saldoBloqueado = R$ 500,00                                        │  │
│  │                                                                     │  │
│  │  Este dinheiro já foi "apostado" numa meta e não deve              │  │
│  │  ser considerado disponível para gastos.                           │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  6. SALDO LIVRE (Disponível para Gastos)                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  saldoLivre = saldoAtual - saldoBloqueado                          │  │
│  │                                                                     │  │
│  │  saldoLivre = 2.800 - 500                                          │  │
│  │  saldoLivre = R$ 2.300,00                                          │  │
│  │                                                                     │  │
│  │  Este é o dinheiro que você pode gastar LIVREMENTE.                │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  7. TOTAL GERAL (Para os Mini Cards)                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  totalEntradas = max(entradasPagas, entradasPrevistas)              │  │
│  │  totalEntradas = max(5.000, 5.000) = R$ 5.000,00                   │  │
│  │                                                                     │  │
│  │  totalSaidas = max(saidasPagas, saidasPrevistas)                     │  │
│  │  totalSaidas = max(2.200, 2.500) = R$ 2.500,00                      │  │
│  │                                                                     │  │
│  │  totalSaldo = totalEntradas - totalSaidas                           │  │
│  │  totalSaldo = 5.000 - 2.500 = R$ 2.500,00                          │  │
│  │                                                                     │  │
│  │  diferencaEntradas = entradasPrevistas - entradasPagas              │  │
│  │  diferencaEntradas = 5.000 - 5.000 = R$ 0,00                        │  │
│  │                                                                     │  │
│  │  diferencaSaidas = saidasPrevistas - saidasPagas                    │  │
│  │  diferencaSaidas = 2.500 - 2.200 = R$ 300,00                        │  │
│  │  (Positivo = ainda não saiu, mas vai sair)                         │  │
│  │                                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                           RESUMO VISUAL
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                     💰 MINHA SITUAÇÃO FINANCEIRA                        │
│                         Janeiro/2024                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  💵 ENTRADAS                          💸 SAÍDAS                          │
│  ──────────────────                  ──────────────────                 │
│  Recebido:    R$ 5.000,00            Pago:        R$ 2.200,00           │
│  Agendado:    R$ 0,00                Agendado:    R$ 300,00            │
│  Projetado:   R$ 0,00                Projetado:   R$ 0,00              │
│  ──────────────────                  ──────────────────                 │
│  TOTAL:       R$ 5.000,00            TOTAL:       R$ 2.500,00           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  💼 SALDOS                                                               │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  Saldo Atual:       R$ 2.800,00  │  Dinheiro real em conta             │
│  Saldo Projetado:   R$ 2.500,00  │  Expectativa final do mês           │
│  Saldo Bloqueado:   R$ 500,00    │  Reservado para metas               │
│  Saldo Livre:       R$ 2.300,00  │  Pode gastar à vontade              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 DIFERENÇAS                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  Entradas:       R$ 0,00    │  Tudo que era esperado já veio           │
│  Saídas:        R$ 300,00  │  Ainda vai sair (plano de saúde)         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
```

---

## 4. Referência de Campos

### 4.1 User (Usuário)

```typescript
interface User {
  id: number;                    // Int, PK, Autoincrement
  username: string;              // Nome de usuário (login)
  email: string;                 // Email único do usuário
  password: string;              // Senha criptografada
  role: 'ADMIN' | 'USER';        // Papel do usuário no sistema
  status: 'A' | 'I';             // A=Ativo, I=Inativo
  deletedAt: Date | null;        // Soft delete (NULL = ativo)
  createdAt: Date;               // Data de criação
  updatedAt: Date;                // Data da última atualização
}

// Relacionamentos
User.categorias: Categoria[]     // 1:N
User.despesas: Despesa[]          // 1:N
User.receitas: Receita[]          // 1:N
User.metas: Meta[]               // 1:N
User.lancamentos: Lancamento[]   // 1:N
```

**Índices:**
```sql
@@index([email])
@@index([role])
@@index([status])
```

---

### 4.2 Categoria

```typescript
interface Categoria {
  id: number;                    // Int, PK, Autoincrement
  userId: number;                // Int, FK → User.id
  nome: string;                  // Nome da categoria (ex: "Moradia", "Alimentação")
  descricao: string | null;      // Descrição opcional
  icone: string | null;          // Ícone para exibição (ex: "home", "restaurant")
  cor: string | null;            // Cor em hexadecimal (ex: "#FF5722")
  deletedAt: Date | null;        // Soft delete (NULL = ativo)
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
}

// Relacionamentos
Categoria.user: User             // N:1
Categoria.despesas: Despesa[]    // 1:N
Categoria.receitas: Receita[]    // 1:N
Categoria.lancamentos: Lancamento[] // 1:N
```

**Índices:**
```sql
@@index([userId])
@@index([nome])
```

**Validações:**
- `nome`: Obrigatório, string, max 100 caracteres
- `userId`: Obrigatório, deve existir na tabela User

---

### 4.3 Despesa

```typescript
interface Despesa {
  id: number;                    // Int, PK, Autoincrement
  userId: number;                // Int, FK → User.id
  categoriaId: number;           // Int, FK → Categoria.id
  nome: string;                   // Nome da despesa (ex: "Aluguel", "Internet")
  tipo: 'FIXA' | 'VARIAVEL' | 'DIVIDA';  // Tipo da despesa
  valorEstimado: Decimal | null; // Valor mensal estimado (R$)
  valorTotal: Decimal | null;    // Valor total (para DÍVIDA)
  totalParcelas: number | null;  // Total de parcelas (para DÍVIDA)
  diaVencimento: number | null;  // Dia do mês do vencimento (1-31)
  dataInicio: Date | null;       // Data de início (para DÍVIDA)
  status: 'A' | 'I';             // A=Ativo (aparece), I=Inativo (não aparece)
  icone: string | null;          // Ícone para exibição
  cor: string | null;            // Cor em hexadecimal
  deletedAt: Date | null;        // Soft delete (NULL = ativo)
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
}

// Relacionamentos
Despesa.user: User               // N:1
Despesa.categoria: Categoria      // N:1
Despesa.lancamentos: Lancamento[] // 1:N
```

**Índices:**
```sql
@@index([userId, status, deletedAt, tipo])
@@index([userId])
@@index([categoriaId])
@@index([status])
```

**Regras por Tipo:**

| Tipo | valorEstimado | valorTotal | totalParcelas | diaVencimento | dataInicio |
|------|--------------|------------|---------------|---------------|-----------|
| `FIXA` | ✅ Obrigatório | ❌ | ❌ | ✅ Obrigatório | ❌ |
| `VARIAVEL` | ❌ Opcional | ❌ | ❌ | ❌ Opcional | ❌ |
| `DIVIDA` | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório | ✅ Obrigatório | ✅ Opcional |

**Quando aparece nas projeções:**

| Condição | Aparece? |
|----------|----------|
| `status = 'A'` E `tipo = 'FIXA'` E `deletedAt IS NULL` | ✅ Sim |
| `status = 'A'` E `tipo = 'DIVIDA'` E `deletedAt IS NULL` E `(valorTotal - totalPago) > 0` | ✅ Sim |
| `status = 'A'` E `tipo = 'VARIAVEL'` E `deletedAt IS NULL` | ❌ Não (não é projetado) |
| `status = 'I'` | ❌ Não |
| `deletedAt IS NOT NULL` | ❌ Não |

---

### 4.4 Receita

```typescript
interface Receita {
  id: number;                    // Int, PK, Autoincrement
  userId: number;                // Int, FK → User.id
  categoriaId: number;           // Int, FK → Categoria.id
  nome: string;                  // Nome da receita (ex: "Salário", "Freelance")
  tipo: 'FIXA' | 'VARIAVEL';    // Tipo da receita
  valorEstimado: Decimal | null; // Valor mensal estimado (R$)
  diaRecebimento: number | null; // Dia do mês do recebimento (1-31)
  status: 'A' | 'I';             // A=Ativo, I=Inativo
  icone: string | null;          // Ícone para exibição
  cor: string | null;            // Cor em hexadecimal
  deletedAt: Date | null;        // Soft delete (NULL = ativo)
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
}

// Relacionamentos
Receita.user: User               // N:1
Receita.categoria: Categoria      // N:1
Receita.lancamentos: Lancamento[] // 1:N
```

**Índices:**
```sql
@@index([userId, status, deletedAt, tipo])
@@index([userId])
@@index([categoriaId])
@@index([status])
```

**Regras por Tipo:**

| Tipo | valorEstimado | diaRecebimento |
|------|--------------|---------------|
| `FIXA` | ✅ Obrigatório | ✅ Obrigatório |
| `VARIAVEL` | ❌ Opcional | ❌ Opcional |

**Quando aparece nas projeções:**

| Condição | Aparece? |
|----------|----------|
| `status = 'A'` E `tipo = 'FIXA'` E `deletedAt IS NULL` | ✅ Sim |
| `status = 'A'` E `tipo = 'VARIAVEL'` E `deletedAt IS NULL` | ❌ Não (não é projetado) |
| `status = 'I'` | ❌ Não |
| `deletedAt IS NOT NULL` | ❌ Não |

---

### 4.5 Lancamento

```typescript
interface Lancamento {
  id: number;                    // Int, PK, Autoincrement
  userId: number;                // Int, FK → User.id
  categoriaId: number;           // Int, FK → Categoria.id
  despesaId: number | null;     // Int?, FK → Despesa.id (XOR)
  receitaId: number | null;      // Int?, FK → Receita.id (XOR)
  metaId: number | null;         // Int?, FK → Meta.id (XOR)
  tipo: 'pagamento' | 'agendamento'; // Tipo da transação
  valor: Decimal;                // Valor da transação (R$)
  data: DateTime;                // Data da transação
  observacao: string | null;     // Observação manual do usuário
  observacaoAutomatica: string | null; // Observação gerada pelo sistema (ex: parcelas)
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
}

// Relacionamentos
Lancamento.user: User           // N:1
Lancamento.categoria: Categoria // N:1
Lancamento.despesa: Despesa | null    // N:1
Lancamento.receita: Receita | null    // N:1
Lancamento.meta: Meta | null          // N:1
```

**Índices:**
```sql
@@index([userId, data])
@@index([despesaId])
@@index([receitaId])
@@index([categoriaId])
@@index([metaId])
```

**Regras de Relacionamento (XOR - Ou Exclusivo):**

```
✅ Válido:
  - despesaId = 5, receitaId = null, metaId = null
  - despesaId = null, receitaId = 3, metaId = null
  - despesaId = null, receitaId = null, metaId = 2
  - despesaId = null, receitaId = null, metaId = null (lançamento genérico)

❌ Inválido:
  - despesaId = 5, receitaId = 3 (ambos preenchidos)
  - despesaId = 5, metaId = 2 (ambos preenchidos)
  - receitaId = 3, metaId = 2 (ambos preenchidos)
```

**Regras de Tipo:**

| Tipo | Descrição | Uso típico |
|------|-----------|-----------|
| `pagamento` | Transação realizada | "Já paguei/recebi" |
| `agendamento` | Transação planejada | "Vou pagar/receber" |

**Observação Automática (Parcelas):**

Quando um lançamento é criado com múltiplas parcelas, a `observacaoAutomatica` é gerada:

```typescript
// Exemplo: Parcela 2 de 12, valor R$ 250,00, dia 15/03
observacaoAutomatica: "descrição (2/12) - R$ 250,00 (15/03)"
```

**SEM SOFT DELETE:**
- Lançamentos usam **hard delete** permanente
- Não há campo `deletedAt`
- Representam histórico financeiro real

---

### 4.6 Meta

```typescript
interface Meta {
  id: number;                    // Int, PK, Autoincrement
  userId: number;                // Int, FK → User.id
  nome: string;                  // Nome da meta (ex: "Viagem para Disney")
  valorMeta: Decimal;            // Valor objetivo (R$)
  dataAlvo: DateTime;           // Prazo para atingir a meta
  status: 'A' | 'I';             // A=Ativo, I=Inativo
  icone: string | null;          // Ícone para exibição
  cor: string | null;            // Cor em hexadecimal
  deletedAt: Date | null;        // Soft delete (NULL = ativo)
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
}

// Relacionamentos
Meta.user: User                  // N:1
Meta.lancamentos: Lancamento[]   // 1:N (aportes do usuário)
```

**Índices:**
```sql
@@index([userId, status, deletedAt])
@@index([userId])
@@index([status])
```

**Cálculo de Saldo Bloqueado:**

```sql
saldoBloqueado = SUM(lancamento.valor) 
                  WHERE metaId = Meta.id 
                  AND tipo = 'pagamento'
                  AND meta.status = 'A'
                  AND meta.deletedAt IS NULL
```

**Regras de Validação:**
- `nome`: Obrigatório, string, max 100 caracteres
- `valorMeta`: Obrigatório, Decimal, > 0
- `dataAlvo`: Obrigatório, DateTime, deve ser futura

**Quando não aparece:**
- `status = 'I'` → Não aparece em nenhuma listagem
- `deletedAt IS NOT NULL` → Soft deleted

---

### 4.7 Enum: TipoLancamento

```typescript
enum TipoLancamento {
  pagamento = 'pagamento',      // Transação realizada
  agendamento = 'agendamento'   // Transação planejada
}
```

**Uso:** Campo `tipo` na tabela `Lancamento`

---

### 4.8 Enum: TipoDespesa

```typescript
enum TipoDespesa {
  FIXA = 'FIXA',                // Gasto mensal fixo
  VARIAVEL = 'VARIAVEL',        // Gasto ocasional
  DIVIDA = 'DIVIDA'             // Parcelamento
}
```

**Uso:** Campo `tipo` na tabela `Despesa`

**Comportamento nas projeções:**

| Tipo | Projetado? | Condição |
|------|-----------|----------|
| `FIXA` | ✅ Sim | status='A' E deletedAt IS NULL |
| `VARIAVEL` | ❌ Não | Nunca é projetado |
| `DIVIDA` | ✅ Sim | status='A' E deletedAt IS NULL E saldo>0 |

---

### 4.9 Enum: TipoReceita

```typescript
enum TipoReceita {
  FIXA = 'FIXA',                // Renda mensal fixa
  VARIAVEL = 'VARIAVEL'         // Renda ocasional
}
```

**Uso:** Campo `tipo` na tabela `Receita`

**Comportamento nas projeções:**

| Tipo | Projetado? | Condição |
|------|-----------|----------|
| `FIXA` | ✅ Sim | status='A' E deletedAt IS NULL |
| `VARIAVEL` | ❌ Não | Nunca é projetado |

---

### 4.10 Status (Campos Common)

Várias entidades usam um campo `status` com os mesmos valores:

```typescript
type Status = 'A' | 'I';

// A = Ativo (aparece em todas as operações)
// I = Inativo (não aparece em nada)
```

**Entidades com campo `status`:**
- User
- Categoria
- Despesa
- Receita
- Meta

**Tabela de Referência:**

| Status | Listagens | Projeções | Cálculos |
|--------|-----------|-----------|----------|
| `'A'` | ✅ Aparece | ✅ Incluído | ✅ Considerado |
| `'I'` | ❌ Não aparece | ❌ Excluído | ❌ Ignorado |

---

## 5. Tabela Resumo: Comportamento por Entidade

```
╔══════════════════╦═══════════╦════════════════════╦════════════════════╦═══════════════════╗
║     ENTIDADE     ║ SOFT DEL  ║ PODE SER PROJETADO ║ TEM STATUS (A/I)  ║ TIPO DE DELETE    ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ User             ║ ✅        ║ ❌                 ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Categoria        ║ ✅        ║ ❌                 ║ ❌                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Despesa (FIXA)   ║ ✅        ║ ✅                 ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Despesa (VARIAV) ║ ✅        ║ ❌                 ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Despesa (DIVIDA) ║ ✅        ║ ✅ (enq. saldo>0)  ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Receita (FIXA)   ║ ✅        ║ ✅                 ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Receita (VARIAV) ║ ✅        ║ ❌                 ║ ✅                 ║ Soft Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Lancamento       ║ ❌        ║ N/A (é real)       ║ N/A               ║ Hard Delete      ║
╠══════════════════╬═══════════╬════════════════════╬════════════════════╬═══════════════════╣
║ Meta             ║ ✅        ║ ❌ (bloqueia saldo) ║ ✅                 ║ Soft Delete      ║
╚══════════════════╩═══════════╩════════════════════╩════════════════════╩═══════════════════╝

LEGENDA:
═══════════════════════════════════════════════════════════════════════════════
SOFT DELETE:
  ✅ = Tem deletedAt (recuperável)
  ❌ = Não tem (excluído permanentemente)

PODE SER PROJETADO:
  ✅ = Aparece automaticamente nas projeções do resumo
  ❌ = Não é projetado (só aparece via lançamento manual)
  ✅ (condição) = Projetado dependendo de alguma condição

TEM STATUS (A/I):
  ✅ = Tem campo status (ativa/inativa)
  ❌ = Não tem campo status

TIPO DE DELETE:
  Soft Delete = deletedAt = NOW(), recuperável
  Hard Delete = DELETE FROM, irreversível
═══════════════════════════════════════════════════════════════════════════════
```

---

## 6. Glossário

### Termos Técnicos

| Termo | Significado |
|-------|------------|
| **Soft Delete** | Exclusão lógica usando `deletedAt` em vez de `DELETE`. Permite recuperação. |
| **Hard Delete** | Exclusão física permanente. Não há volta. |
| **Projeção** | Cálculo automático de valores esperados baseado em recorrências. |
| **CTE** | Common Table Expression. Subquery nomeada no SQL (WITH ... AS). |
| **XOR** | Ou Exclusivo. Apenas uma das opções pode ser verdadeira. |
| **CROSS JOIN** | Produto cartesiano. Combina cada linha de uma tabela com todas da outra. |
| **FULL OUTER JOIN** | Une duas tabelas, mantendo linhas de ambos os lados mesmo sem correspondência. |
| **Generate Series** | Função PostgreSQL que gera uma série de valores/intervalos. |

### Termos de Domínio

| Termo | Significado |
|-------|------------|
| **Despesa Fixa** | Gasto recorrente mensal (aluguel, internet, etc) |
| **Despesa Variável** | Gasto ocasional sem padrão definido (supermercado, lazer) |
| **Dívida** | Parcelamento de compra (TV, carro, etc) com saldo devedor |
| **Parcela** | Parte de um pagamento dividido (ex: 12x de R$ 250) |
| **Amortização** | Redução progressiva do saldo devedor |
| **Saldo Devedor** | Valor restante a pagar de uma dívida |
| **Lançamento** | Registro de uma transação (pagamento ou agendamento) |
| **Agendamento** | Transação planejada para futuro |
| **Aporte** | Depósito em uma meta de economia |
| **Saldo Bloqueado** | Dinheiro reservado em metas |
| **Saldo Livre** | Dinheiro disponível para gastar |

---

## 7. Exemplos Completos de Cenários

### 7.1 Cenário 1: Usuário Iniciante

```
CONtexto:
  Maria criou sua conta hoje (15/03/2024) e quer organizar suas finanças.

AÇÕES:
  1. Criou categorias:
     - "Moradia" (casa/apartamento)
     - "Transporte" (carro)
     - "Alimentação" (comida)
     - "Renda" (salário)

  2. Criou despesas:
     - "Aluguel": FIXA, R$ 1.200,00, dia 10, status: A
     - "Internet": FIXA, R$ 100,00, dia 15, status: A
     - "Carro": VARIAVEL, sem valor definido, status: A
     - "TV": DIVIDA, R$ 3.000 total, R$ 250/mês, 12x, dia 5, status: A

  3. Criou receitas:
     - "Salário": FIXA, R$ 3.000,00, dia 5, status: A
     - "Freelance": VARIAVEL, sem valor definido, status: A

  4. Registrou pagamentos de Março:
     - Dia 5: Recebi salário R$ 3.000 (pagamento)
     - Dia 5: Paguei parcela TV R$ 250 (pagamento)
     - Dia 10: Paguei aluguel R$ 1.200 (pagamento)
     - Dia 15: Paguei internet R$ 100 (pagamento)
     - Dia 20: Paguei supermercado R$ 350 (pagamento - despesa VARIAVEL)

RESULTADO NO RESUMO MARÇO/2024:
  Entradas:
    - Salário: R$ 3.000,00 (Pago)
    - Total: R$ 3.000,00

  Saídas:
    - Aluguel: R$ 1.200,00 (Pago)
    - TV LED: R$ 250,00 (Pago)
    - Internet: R$ 100,00 (Pago)
    - Supermercado: R$ 350,00 (Pago)
    - Total: R$ 1.900,00

  Saldo Atual: R$ 1.100,00
  Saldo Projetado (Abril): R$ 2.850,00
    - Salário: R$ 3.000,00
    - TV LED: R$ 250,00 (parcela 2/12)
    - Internet: R$ 100,00
    - Obs: Não projeta aluguel porque Maria criou em 15/mar
          e o aluguel já passou (dia 10)

  Saldo Livre: R$ 1.100,00 (sem metas)
```

### 7.2 Cenário 2: Dívida sendo Quitada

```
CONTEXTO:
  João tem uma dívida de TV no valor total de R$ 3.000,00
  Parcelas: 12x de R$ 250,00
  Dia de vencimento: 5 de cada mês
  Início: Janeiro/2024

CRONOLOGIA DOS PAGAMENTOS:

Janeiro/2024:
  João paga: R$ 250,00
  Saldo devedor: R$ 2.750,00
  Projeção Fevereiro: ✅ Aparece (250 < 3000)

Fevereiro/2024:
  João paga: R$ 250,00
  Saldo devedor: R$ 2.500,00
  Projeção Março: ✅ Aparece

Março/2024:
  João paga: R$ 250,00
  Saldo devedor: R$ 2.250,00
  Projeção Abril: ✅ Aparece

... (João continua pagando mensalmente)

Dezembro/2024:
  João paga: R$ 250,00
  Saldo devedor: R$ 250,00
  Projeção Janeiro/2025: ✅ Aparece

Janeiro/2025:
  João paga: R$ 250,00
  Saldo devedor: R$ 0,00
  Projeção Fevereiro/2025: ❌ NÃO APARECE (250 - 3000 = 0, não é > 0)

RESUMO:
  Total pago: R$ 3.000,00 (12 parcelas)
  Duração real: 12 meses (Jan/2024 - Jan/2025)
  Saldo final: R$ 0,00 (dívida quitada)

  A partir de Fevereiro/2025, a TV LED não aparece mais
  nas projeções porque (valorTotal - totalPago) = 0
```

### 7.3 Cenário 3: Soft Delete e Recuperação

```
CONTEXTO:
  Carlos criou uma despesa "Aluguel" em Janeiro/2024
  Em Março, ele quer "deletar" essa despesa para não ver mais.

AÇÃO:
  UPDATE despesa SET deletedAt = '2024-03-15' WHERE id = 1;

RESULTADO IMEDIATO:
  ❌ "Aluguel" não aparece mais nas listagens
  ❌ "Aluguel" não aparece mais nas projeções de resumo
  ❌ Saldo não considera mais essa despesa

  Mas:
  ✅ Os lançamentos vinculados ainda existem
  ✅ Os lançamentos mostram "sem categoria"

RECUPERAÇÃO (Carlos se arrepende):
  UPDATE despesa SET deletedAt = NULL WHERE id = 1;

RESULTADO PÓS-RECUPERAÇÃO:
  ✅ "Aluguel" volta a aparecer nas listagens
  ✅ "Aluguel" volta a aparecer nas projeções
  ✅ Lançamentos voltam a mostrar a categoria corretamente
  ✅ Tudo como era antes
```

---

## 8. Fluxo de Dados: Como tudo se Conecta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO COMPLETO DE DADOS                               │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                           FASE 1: CRIAÇÃO
═══════════════════════════════════════════════════════════════════════════════

USUÁRIO
  │
  ├─→ cria CATEGORIA ──────────→ Categoria { id, nome, userId }
  │                                 │
  │                                 │
  ├─→ cria DESPESA ────────────→ Despesa { id, nome, tipo, userId, categoriaId }
  │   (FIXA/VARIAVEL/DIVIDA)         │
  │                                     │
  │                                     │
  ├─→ cria RECEITA ────────────→ Receita { id, nome, tipo, userId, categoriaId }
  │   (FIXA/VARIAVEL)                  │
  │                                        │
  │                                        │
  └─→ cria META ──────────────→ Meta { id, nome, valorMeta, userId }
                                  │
                                  │
                                  │
═══════════════════════════════════════════════════════════════════════════════
                           FASE 2: TRANSAÇÕES
═══════════════════════════════════════════════════════════════════════════════

USUÁRIO REGISTRA LANÇAMENTO
  │
  ├─→ PAGAMENTO ────────────────→ Lancamento { tipo: 'pagamento', valor, data }
  │                                   │
  │                                   │
  ├─→ AGENDAMENTO ─────────────→ Lancamento { tipo: 'agendamento', valor, data }
  │                                   │
  │                                   │
  └─→ APORTE META ───────────────→ Lancamento { tipo: 'pagamento', metaId }
                                      │
                                      │
═══════════════════════════════════════════════════════════════════════════════
                         FASE 3: PROJEÇÃO AUTOMÁTICA
═══════════════════════════════════════════════════════════════════════════════

SISTEMA GERA PROJEÇÕES AUTOMATICAMENTE

  Para DESPESA FIXA:
    ─────────────────
    SELECT FROM Despesa
    WHERE tipo = 'FIXA'
      AND status = 'A'
      AND deletedAt IS NULL
      AND createdAt <= período
    │
    │ Para cada mês do período
    │
    └─→ Projeta: valorEstimado, diaVencimento

  Para DÍVIDA:
    ────────────
    SELECT FROM Despesa
    WHERE tipo = 'DIVIDA'
      AND status = 'A'
      AND deletedAt IS NULL
      AND (valorTotal - totalPago) > 0
    │
    │ Para cada mês enquanto saldo > 0
    │
    └─→ Projeta: valorEstimado, diaVencimento

  Para RECEITA FIXA:
    ─────────────────
    SELECT FROM Receita
    WHERE tipo = 'FIXA'
      AND status = 'A'
      AND deletedAt IS NULL
      AND createdAt <= período
    │
    │ Para cada mês do período
    │
    └─→ Projeta: valorEstimado, diaRecebimento


═══════════════════════════════════════════════════════════════════════════════
                           FASE 4: CONSOLIDAÇÃO
═══════════════════════════════════════════════════════════════════════════════

SISTEMA JUNTA TUDO NO RESUMO

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   PROJEÇÕES AUTOMÁTICAS (Recorrências)                      │
  │   ┌─────────────────────────────────────────────────────┐   │
  │   │  • Despesas FIXAS projetadas mensalmente            │   │
  │   │  • DÍVIDAS projetadas enquanto saldo > 0            │   │
  │   │  • Receitas FIXAS projetadas mensalmente            │   │
  │   └─────────────────────────────────────────────────────┘   │
  │                            │                                │
  │                            │ FULL OUTER JOIN                │
  │                            ▼                                │
  │   ┌─────────────────────────────────────────────────────┐   │
  │   │  LANÇAMENTOS REAIS (Pagamentos e Agendamentos)      │   │
  │   │  • Pagamentos realizados                            │   │
  │   │  • Agendamentos manuais                             │   │
  │   └─────────────────────────────────────────────────────┘   │
  │                            │                                │
  │                            │                                │
  └────────────────────────────┼────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         RESUMO CONSOLIDADO                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  CARD RESUMO:                                                         │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │                                                                       │  │
│  │  totalTransacoes: (pagamentos + agendamentos + projeções)              │  │
│  │                                                                       │  │
│  │  totalEntradas: max(entradasPagas, entradasPrevistas)                 │  │
│  │  entradasPagas: soma de pagamentos com receitaId                     │  │
│  │  entradasAgendadas: soma de agendamentos com receitaId                 │  │
│  │  entradasProjetadas: soma de receitas FIXAS projetadas                 │  │
│  │                                                                       │  │
│  │  totalSaidas: max(saidasPagas, saidasPrevistas)                       │  │
│  │  saidasPagas: soma de pagamentos com despesaId                        │  │
│  │  saidasAgendadas: soma de agendamentos com despesaId                   │  │
│  │  saidasProjetadas: soma de despesas FIXAS e DÍVIDAS projetadas        │  │
│  │                                                                       │  │
│  │  saldoAtual: entradasPagas - saidasPagas                             │  │
│  │  saldoProjetado: entradasPrevistas - saidasPrevistas                  │  │
│  │  saldoBloqueado: soma de lançamentos com metaId (ativas)              │  │
│  │  saldoLivre: saldoAtual - saldoBloqueado                              │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  LISTA DE ITENS:                                                      │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │                                                                       │  │
│  │  Para cada item (origem + mês):                                       │  │
│  │                                                                       │  │
│  │  {                                                                    │  │
│  │    id: "origem-id-mes-ano",                                          │  │
│  │    nome: "Nome da despesa/receita",                                  │  │
│  │    valorPrevisto: valor projetado,                                    │  │
│  │    valorPago: valor realmente pago,                                   │  │
│  │    mes: número,                                                       │  │
│  │    ano: número,                                                       │  │
│  │    status: "Pago" | "Parcial" | "Vencido há X dias" | "Vence em X dias",│ │
│  │    atrasado: boolean,                                                 │  │
│  │    detalhes: [array de lançamentos vinculados]                        │  │
│  │  }                                                                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         FASE 5: CÁLCULO DE STATUS
═══════════════════════════════════════════════════════════════════════════════

PARA CADA ITEM NO RESUMO, O SISTEMA CALCULA O STATUS:

  SE valorPago > 0:
    SE valorPago < valorPrevisto:
      → "Parcial" (isAtrasado: false)
    SENÃO:
      → "Pago" (isAtrasado: false)

  SENÃO (valorPago == 0):
    SE diaVencimento == null:
      → "" (isAtrasado: false)

    SENÃO:
      SE dataVencimento < hoje:
        → "Vencido há X dias" (isAtrasado: true)
      SENÃO SE dataVencimento == hoje:
        → "Vence hoje" (isAtrasado: false)
      SENÃO:
        → "Vence em X dias" (isAtrasado: false)


═══════════════════════════════════════════════════════════════════════════════
                         FASE 6: INTERFACE (FRONTEND)
═══════════════════════════════════════════════════════════════════════════════

RESUMO É EXIBIDO NO FRONTEND

  Dashboard:
    ├─→ Mini Cards (totais, entradas, saídas, saldos)
    ├─→ Lista de itens próximos a vencer
    └─→ Últimas transações

  Página de Resumo:
    ├─→ Filtros por período
    ├─→ Lista completa de itens com status
    └─→ Detalhes de cada item (lançamentos vinculados)

  Página de Lançamentos:
    ├─→ Lista de todas transações
    ├─→ Filtros por tipo, categoria, período
    └─→ Criação de novos lançamentos
```

---

## 9. Conclusão

Este documento apresentou a **regra de negócio completa** do MagicBox, cobrindo:

1. **Conceitual**: Entidades, relacionamentos, hierarquia de dados e lógica de negócio
2. **Exemplos Práticos**: Queries SQL detalhadas mostrando exatamente como o sistema funciona
3. **Diagramas de Fluxo**: Visualização completa da arquitetura e processos
4. **Referência de Campos**: Documentação técnica de todas as entidades e campos

### Pontos Chave para Lembrar:

✅ **Soft Delete**: Categorias, Despesas, Receitas e Metas usam `deletedAt` para permitir recuperação

✅ **Projeções**: Apenas Despesas FIXAS, DÍVIDAS (enquanto saldo>0) e Receitas FIXAS são projetadas automaticamente

✅ **Status Calculation**: O sistema calcula automaticamente se cada item está pago, parcial, vencido ou a vencer

✅ **Saldos**: O sistema mantém 4 tipos de saldo (Atual, Projetado, Bloqueado, Livre) para dar visão completa da situação financeira

✅ **XOR Relationship**: Lançamentos só podem estar vinculados a UMA entidade (despesa OU receita OU meta)

✅ **Parcelas**: O sistema suporta criação automática de parcelas com observações formatadas

---

*Documento gerado em: 2024*
*Versão do Sistema: 1.0*
*MagicBox - Gestão Financeira Pessoal*
