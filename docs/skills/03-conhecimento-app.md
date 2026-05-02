# Skill: Conhecimento do MagicBox

Entenda o app para explicar ao usuário de forma clara e ajudá-lo a navegar.

---

## Glossário Financeiro (3 conceitos principais)

### Saldo Atual
Todo o dinheiro que o usuário realmente possui.
- **Fórmula**: Entradas reais - Saídas reais
- É o total disponível na conta bancária vinculada

### Saldo Bloqueado
Dinheiro guardado em Metas. Este dinheiro **não sumiu**, está reservado para objetivos de longo prazo.
- Uso典型: Viagem, Cursos, Reserva de Emergência
- O sistema "bloqueia" esse valor para que o usuário não gaste sem querer

### Saldo Livre (O mais importante)
O dinheiro que o usuário **de fato pode gastar** no dia a dia.
- **Fórmula**: `Saldo Livre = Saldo Atual - Saldo Bloqueado`
- Se o usuário perguntar "quanto eu tenho", foque neste aqui

---

## Tipos de Conta e Lançamentos

### Despesas Avulsas/Comuns
Despesas do dia a dia. Geralmente contas de consumo ou compras instantâneas.
- Criadas pelo botão central flutuante (+)
- Não são dívidas formais

### Receitas
Entradas de dinheiro como salário, rendimentos extras, freelancer.
- Criadas pelo botão central flutuante (+)
- Aumentam o Saldo Atual

### Metas Financeiras
Objetivos de longo prazo. Quando o usuário faz um "Pagamento" em uma Meta ativa, o valor se converte em Saldo Bloqueado.
- Criadas em: /cadastros/metas
- Precisam de aportes periódicos para avançar

---

## Gestão de Dívidas

### Dívida Única (Parcelamento)
Itens com fim claro, como compra de TV em 12x.
- Na criação, o sistema agenda todas as parcelas automaticamente
- Permite **antecipação**: pagar uma fatura futura abatemonto aquele mês diretamente

### Dívida Variável (Despesas Recorrentes)
Contas sem data para acabar ou que variam muito: Mercado, Luz, Internet.
- Quando 100% da conta do mês é paga, o Card **desaparece** temporariamente da aba de dívidas
- Retorna **magicamente** no futuro quando um novo vencimento é agendado

---

## Links de Navegação (Markdown)

Use estes links para orientar o usuário onde encontrar as coisas:

| Recurso | Link |
|---------|------|
| Painel Financeiro (Geral) | [Acessar Painel](/resumo) |
| Dashboard Padrão | [Ver Dashboard](/dashboard) |
| Lançamentos e Histórico | [Ver Extrato](/lancamentos) |
| Criar Lançamento Rápido | Botão Central Flutuante (+) na interface |
| Gestão de Dívidas | [Acessar Dívidas](/cadastros/dividas) |
| Gestão de Metas | [Acessar Metas](/cadastros/metas) |

---

## Como Criar itens no App

- **Lançamentos avulsos**: Use o Botão Central Flutuante (+) na interface
- **Dívidas formais**: Acesse /cadastros/dividas (não é possível criar pelo botão +)
- **Metas**: Acesse /cadastros/metas
- **Receitas**: Use o Botão Central Flutuante (+)

> O MagicBox foi planejado para ter Lançamentos como base. Para criar a raiz (Dívida, Meta ou Receita), o usuário deve usar as telas focadas.