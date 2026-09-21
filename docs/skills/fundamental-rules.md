# Skill: Regras Fundamentais do MagicBox

Esta skill descreve a arquitetura base e as restrições globais do sistema MagicBox.

## 1. Hierarquia de Dados
O sistema segue uma estrutura rígida de propriedade:
- **User** (Raiz)
  - **Categoria** (Pertence ao User)
    - **Despesa** (Pertence à Categoria e ao User)
    - **Receita** (Pertence à Categoria e ao User)
    - **Objetivo** (Pertence à Categoria e ao User)
  - **Lancamento** (Pertence ao User)

## 2. Lógica de Soft Delete (`deletedAt`)
Quase todas as entidades principais usam **Soft Delete** para preservar a integridade histórica.

### Entidades com Soft Delete:
- `User`, `Categoria`, `Despesa`, `Receita`, `Objetivo`.

### Comportamento:
- **Filtro Ativo**: Sempre que consultar estas tabelas para exibição ou cálculos, adicione `deletedAt IS NULL`.
- **Efeito no Resumo**: Registros deletados param de ser projetados. Lançamentos reais passados vinculados a eles continuam no banco, mas são **ocultados** da visão de resumo financeiro.
- **Recuperação**: O sistema permite "desfazer" a exclusão setando `deletedAt = NULL`, restaurando a visibilidade e projeções.

## 3. Entidades sem Soft Delete (Hard Delete)
- **Lancamento**: Registros transacionais usam exclusão física permanente. Se deletado, o valor é removido dos cálculos de saldo atual e histórico.

## 4. Modalidades e Vínculo de Lançamentos
Um registro na tabela `lancamento` opera sob as seguintes regras:
- **Lançamentos Operacionais (`pagamento` | `agendamento`)**: Regra XOR rigorosa:
  - **Válido**: (`despesaId` preenchido, outros NULL), (`receitaId` preenchido, outros NULL) ou (`objetivoId` preenchido, outros NULL).
  - **Inválido**: Ter dois ou mais IDs de vínculo preenchidos simultaneamente.
- **Lançamentos de Ajuste de Conciliação (`tipo = 'ajuste'`)**:
  - São **100% autônomos**: `despesaId: NULL`, `receitaId: NULL`, `objetivoId: NULL`.
  - Operam por sinal direto: valores positivos (`+`) representam crédito/entradas e valores negativos (`-`) representam débito/vazamentos de caixa.

## 5. Status de Ativação (`status: 'A' | 'I'`)
Entidades como `Despesa`, `Receita` e `Objetivo` possuem um campo `status`.

- **Ativo ('A')**: O item é considerado para projeções futuras e listagens.
- **Inativo ('I')**: O item **para de ser projetado** no futuro, mas o histórico de lançamentos passados continua **visível** (diferente do Soft Delete, que oculta o passado no resumo).

---
**Validação em Código:**
- Verificado em `prisma/schemas/*.prisma`
- Lógica de filtro verificado em `src/core/lancamentos/resumo/repository.ts`

