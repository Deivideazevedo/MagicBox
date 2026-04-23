# Skill: Regras Fundamentais do MagicBox

Esta skill descreve a arquitetura base e as restrições globais do sistema MagicBox.

## 1. Hierarquia de Dados
O sistema segue uma estrutura rígida de propriedade:
- **User** (Raiz)
  - **Categoria** (Pertence ao User)
    - **Despesa** (Pertence à Categoria e ao User)
    - **Receita** (Pertence à Categoria e ao User)
    - **Meta** (Pertence à Categoria e ao User)
  - **Lancamento** (Vinculado a um User e OBRIGATORIAMENTE a um dos três: Despesa, Receita ou Meta - exceto lançamentos avulsos).

## 2. Lógica de Soft Delete (`deletedAt`)
Quase todas as entidades principais usam **Soft Delete** para preservar a integridade histórica.

### Entidades com Soft Delete:
- `User`, `Categoria`, `Despesa`, `Receita`, `Meta`.

### Comportamento:
- **Filtro Ativo**: Sempre que consultar estas tabelas para exibição ou cálculos, adicione `deletedAt IS NULL`.
- **Efeito no Resumo**: Registros deletados param de ser projetados. Lançamentos reais passados vinculados a eles continuam no banco, mas são **ocultados** da visão de resumo financeiro.
- **Recuperação**: O sistema permite "desfazer" a exclusão setando `deletedAt = NULL`, restaurando a visibilidade e projeções.

## 3. Entidades sem Soft Delete (Hard Delete)
- **Lancamento**: Registros transacionais usam exclusão física permanente. Se deletado, o dinheiro "some" do saldo atual e histórico.

## 4. Restrição XOR (Ou Exclusivo) em Lançamentos
Um registro na tabela `lancamento` **nunca** deve estar vinculado a mais de uma entidade ao mesmo tempo.

- **Válido**: (`despesaId` setado, outros NULL), (`receitaId` setado, outros NULL), (`metaId` setado, outros NULL).
- **Inválido**: Ter dois ou mais IDs de vínculo preenchidos (ex: `despesaId` e `metaId`).

## 5. Status de Ativação (`status: 'A' | 'I'`)
Entidades como `Despesa`, `Receita` e `Meta` possuem um campo `status`.

- **Ativo ('A')**: O item é considerado para projeções futuras e listagens.
- **Inativo ('I')**: O item **para de ser projetado** no futuro, mas o histórico de lançamentos passados continua **visível** (diferente do Soft Delete, que oculta o passado no resumo).

---
**Validação em Código:**
- Verificado em `prisma/schemas/*.prisma`
- Lógica de filtro verificado em `src/core/lancamentos/resumo/repository.ts`
