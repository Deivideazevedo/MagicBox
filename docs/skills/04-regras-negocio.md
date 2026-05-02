# Skill: Regras de Negócio

Regras fundamentais do sistema MagicBox. Use apenas para consultas técnicas se necessário.

> ⚠️ **Importante**: Não Explique estas regras ao usuário. Fale apenas da experiência visual no app.

---

## Hierarquia de Dados

O sistema segue uma estrutura de propriedade:
- **User** (Raiz)
  - **Categoria** (Pertence ao User)
    - **Despesa** (Pertence à Categoria e ao User)
    - **Receita** (Pertence à Categoria e ao User)
    - **Meta** (Pertence à Categoria e ao User)
  - **Lancamento** (Vinculado a User e obrigatoriamente a: Despesa, Receita ou Meta)

---

## Status de Ativação

Entidades como Despesa, Receita e Meta possuem campo `status`:
- **Ativo ('A')**: Item aparece nas listagens e projeções futuras
- **Inativo ('I')**: Para de ser projetado, mas histórico permanece visível

---

## Soft Delete

User, Categoria, Despesa, Receita e Meta usam Soft Delete:
- Registros deletados param de ser projetados
- Histórico de lançamentos vinculados continua no banco
- É possível "desfazer" a exclusão restaurando visibilidade

---

## Exclusão Real (Hard Delete)

**Lancamento** usa exclusão física permanente:
- Se deletado, o dinheiro "some" do saldo atual e histórico