# Skill: Metas e Reservas Financeiras (Objetivos)

Esta skill descreve como o MagicBox gerencia objetivos de economia e a reserva de capital (Saldo Bloqueado).

## 1. Conceito de Objetivo
Um Objetivo representa uma finalidade financeira de poupança no modelo Prisma `Objetivo` (`prisma/schemas/objetivo.prisma`).

### Modalidades (`TipoObjetivo`):
* **`META`**: Possui `valorObjetivo` e `dataAlvo`. Destinada a aquisições ou objetivos com prazo e teto (ex: Comprar Carro, Viagem).
* **`RESERVA`**: Força `valorObjetivo = null` e `dataAlvo = null`. Funciona como um "cofrinho" contínuo sem prazo de término (ex: Fundo de Reserva, Reserva de Emergência).

### Componentes:
- `valorObjetivo`: O valor-alvo a ser atingido (aplicável a `META`).
- `valorAcumulado`: A soma de todos os lançamentos vinculados ao objetivo (`objetivoId`).
- `dataAlvo`: Prazo estimado para concluir o objetivo (aplicável a `META`).

## 2. Saldo Bloqueado
Esta é a regra mais crítica de Metas para o motor financeiro:
- Todo dinheiro aportado em uma meta/reserva (lançamento com `tipo = 'pagamento'` e `objetivoId`) é considerado **Saldo Bloqueado**.
- O sistema entende que este dinheiro, embora esteja no patrimônio geral, está protegido contra gastos diários no Saldo Livre.

### Cálculo:
```sql
saldoBloqueado = SUM(lancamentos.valor) 
                 WHERE "objetivoId" = Objetivo.id 
                 AND lancamento.tipo = 'pagamento'
                 AND objetivo.status = 'A'
                 AND objetivo."deletedAt" IS NULL
```

## 3. Saldo Livre
O **Saldo Livre** é o valor real disponível para o usuário gastar no dia a dia.
- **Fórmula**: `Saldo Livre = Saldo Bruto em Caixa - Saldo Bloqueado em Metas`.

## 4. Retiradas e Resgates
- O resgate de um objetivo é registrado como um lançamento de `tipo = 'pagamento'` com **valor negativo** (`-Math.abs(valor)`), diminuindo o Saldo Bloqueado.
- **Para Saldo Livre:** O valor retorna imediatamente para a liquidez do dia a dia.
- **Para Pagar Despesa:** Dois lançamentos atômicos amarrados por `vinculoId`: um negativo no `objetivoId` e um positivo na `despesaId`.

## 5. Status e Atingimento
- **Ativo ('A')**: O objetivo aparece nas listagens e bloqueia saldo.
- **Inativo ('I')**: O objetivo não bloqueia mais o saldo e não aparece nas listagens de aportes.
- **Progresso**: Calculado como `(valorAcumulado / valorObjetivo) * 100` (para `META`).
- **Meta Concluída**: Quando `valorAcumulado >= valorObjetivo`.

---
**Validação em Código:**
- Motor financeiro: `src/core/financeiro/engine.ts`.
- Repositório de objetivos: `src/core/objetivos/repository.ts`.
- Schema: `prisma/schemas/objetivo.prisma`.

