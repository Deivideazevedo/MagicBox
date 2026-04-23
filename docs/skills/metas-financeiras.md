# Skill: Metas Financeiras

Esta skill descreve como o MagicBox gerencia objetivos de economia e a reserva de capital (Saldo Bloqueado).

## 1. Conceito de Meta
Uma Meta representa um objetivo financeiro de longo prazo (ex: Reserva de Emergência, Viagem Disney).

### Componentes:
- `valorMeta`: O objetivo final a ser atingido.
- `valorAcumulado`: A soma de todos os lançamentos do tipo **Pagamento** vinculados à meta.
- `dataAlvo`: Prazo estimado para concluir a meta.

## 2. Saldo Bloqueado
Esta é a regra mais crítica de Metas para o motor financeiro:
- Todo dinheiro aportado em uma meta (lançamento de pagamento) é considerado **Saldo Bloqueado**.
- O sistema entende que este dinheiro, embora esteja na conta bancária (Saldo Atual), "não pertence mais ao usuário" para gastos comuns.

### Cálculo:
```sql
saldoBloqueado = SUM(lancamentos.valor) 
                 WHERE metaId = Meta.id 
                 AND lancamento.tipo = 'pagamento'
                 AND meta.status = 'A'
                 AND meta.deletedAt IS NULL
```

## 3. Saldo Livre
O **Saldo Livre** é o valor real disponível para o usuário gastar no dia a dia.
- **Fórmula**: `Saldo Livre = Saldo Atual - Saldo Bloqueado`.

## 4. Status e Atingimento
- **Ativo ('A')**: A meta aparece nas listagens e bloqueia saldo.
- **Inativo ('I')**: A meta não bloqueia mais o saldo e não aparece nas listagens de aportes.
- **Progresso**: Calculado como `(valorAcumulado / valorMeta) * 100`.
- **Meta Concluída**: Quando `valorAcumulado >= valorMeta`.

---
**Validação em Código:**
- Cálculo de saldo bloqueado verificado em `src/core/lancamentos/resumo/repository.ts` (CTE `metas_ativas`).
- Schema verificado em `prisma/schemas/meta.prisma`.
