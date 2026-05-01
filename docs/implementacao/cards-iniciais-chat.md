# Plano de Implementação: Cards Iniciais com Perguntas Sugeridas

## 📋 Visão Geral

Adicionar **3 cards de pilares** (Despesas, Saldo, Metas) na tela vazia do chat drawer. Ao clicar em um card, ele expande mostrando perguntas sugeridas pertinentes. Ao clicar numa pergunta, ela é enviada automaticamente ao agente de IA.

---

## 🎯 Onde Implementar

### Arquivo Principal
```
src/app/(Private)/layout/vertical/header/GlobalChat/ChatDrawer.tsx
```

### Ponto de Inserção
Linhas **428-439** — o bloco do estado vazio atual:

```tsx
{visibleMessages.length === 0 && !isLoading ? (
  // ← AQUI entra a nova implementação dos cards
) : (
```

---

## 🧱 Estrutura de Dados

Criar um arquivo de configuração separado para as perguntas sugeridas:

```
src/core/chat/suggested-questions.ts
```

### Interface

```typescript
export interface PerguntaSugerida {
  texto: string;
  categoria: "urgente" | "rotina" | "analise" | "dividas" | "comparacao" | "planejamento" | "alerta" | "progresso" | "conceito";
}

export interface PilarChat {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  perguntaAncora: string; // Pergunta exibida no card fechado
  perguntas: PerguntaSugerida[];
}

export const PILARES_CHAT: PilarChat[] = [
  {
    id: "despesas",
    nome: "Despesas",
    icone: "🧾",
    cor: "#E53E3E",
    perguntaAncora: "Quais contas vencem este mês?",
    perguntas: [
      // Urgente
      { texto: "Quais contas vencem hoje?", categoria: "urgente" },
      { texto: "Tenho alguma conta atrasada?", categoria: "urgente" },
      { texto: "Tenho alguma dívida vencendo hoje?", categoria: "urgente" },
      // Rotina
      { texto: "Quais são minhas despesas pendentes este mês?", categoria: "rotina" },
      { texto: "Quanto eu já gastei este mês?", categoria: "rotina" },
      { texto: "Mostre meus últimos 10 gastos", categoria: "rotina" },
      // Dívidas
      { texto: "Quanto falta para quitar minhas dívidas?", categoria: "dividas" },
      { texto: "Quais compras parceladas ainda estou pagando?", categoria: "dividas" },
      { texto: "Quanto pago por mês em parcelas?", categoria: "dividas" },
      { texto: "Quando termina o parcelamento do meu cartão?", categoria: "dividas" },
      { texto: "Eu tenho dívidas em aberto? Qual o valor total?", categoria: "dividas" },
      // Análise
      { texto: "Qual foi minha maior despesa este mês?", categoria: "analise" },
      { texto: "Onde estou gastando mais dinheiro?", categoria: "analise" },
      { texto: "Em que categoria eu mais gasto?", categoria: "analise" },
      { texto: "Estou gastando mais do que ganho?", categoria: "analise" },
      // Comparação
      { texto: "Gastei mais este mês ou no mês passado?", categoria: "comparacao" },
      { texto: "Compare meus gastos dos últimos 3 meses", categoria: "comparacao" },
      { texto: "Meu gasto aumentou em relação ao mês passado?", categoria: "comparacao" },
      // Planejamento
      { texto: "Tenho contas para vencer essa semana?", categoria: "planejamento" },
      { texto: "Quais despesas estão agendadas para este mês?", categoria: "planejamento" },
      { texto: "Quais contas eu já paguei este mês?", categoria: "planejamento" },
      // Alerta
      { texto: "Existe risco de ficar sem dinheiro este mês?", categoria: "alerta" },
      { texto: "Tenho gastos incomuns recentemente?", categoria: "alerta" },
      { texto: "Estou perto de estourar meu orçamento?", categoria: "alerta" },
    ],
  },
  {
    id: "saldo",
    nome: "Saldo",
    icone: "💰",
    cor: "#38A169",
    perguntaAncora: "Quanto eu tenho disponível hoje?",
    perguntas: [
      // Rotina
      { texto: "Quanto eu tenho disponível hoje?", categoria: "rotina" },
      { texto: "Quanto entrou este mês?", categoria: "rotina" },
      { texto: "Quanto tenho na conta agora?", categoria: "rotina" },
      { texto: "Quanto tenho guardado em metas?", categoria: "rotina" },
      { texto: "Qual é meu saldo bloqueado?", categoria: "rotina" },
      // Comparação
      { texto: "Meu saldo aumentou ou diminuiu em relação ao mês passado?", categoria: "comparacao" },
      { texto: "Meu saldo atual é maior que o do mês passado?", categoria: "comparacao" },
      { texto: "Qual mês tive mais saldo?", categoria: "comparacao" },
      // Projeção
      { texto: "Quanto terei disponível no fim do mês?", categoria: "planejamento" },
      { texto: "Quanto ainda vai entrar este mês?", categoria: "planejamento" },
      // Alerta
      { texto: "Vou conseguir pagar todas as contas este mês?", categoria: "alerta" },
      { texto: "Existe risco de ficar sem dinheiro?", categoria: "alerta" },
      // Histórico
      { texto: "Qual foi meu saldo no início do mês?", categoria: "rotina" },
      { texto: "Quando eu economizei mais dinheiro?", categoria: "rotina" },
    ],
  },
  {
    id: "metas",
    nome: "Metas",
    icone: "🎯",
    cor: "#805AD5",
    perguntaAncora: "Como está meu progresso nas metas?",
    perguntas: [
      // Rotina
      { texto: "Quanto eu tenho guardado no total?", categoria: "rotina" },
      { texto: "Quanto eu guardei este mês?", categoria: "rotina" },
      { texto: "Quais são minhas metas ativas?", categoria: "rotina" },
      // Progresso
      { texto: "Quanto falta para atingir minha meta?", categoria: "progresso" },
      { texto: "Qual meu progresso em cada meta?", categoria: "progresso" },
      { texto: "Estou no ritmo certo para atingir meu objetivo?", categoria: "progresso" },
      { texto: "Já bati alguma meta recentemente?", categoria: "progresso" },
      // Planejamento
      { texto: "Quanto deveria economizar por mês para bater minha meta?", categoria: "planejamento" },
      { texto: "Quando devo concluir minha meta no ritmo atual?", categoria: "planejamento" },
      // Conceito
      { texto: "O que é Saldo Bloqueado?", categoria: "conceito" },
      { texto: "O que é Saldo Livre?", categoria: "conceito" },
      { texto: "Qual a diferença entre Saldo Atual e Saldo Livre?", categoria: "conceito" },
    ],
  },
];
```

---

## 🖼️ Design da UI

### Estado 1: Tela Inicial (3 Cards)

```
┌──────────────────────────────────┐
│  👋 Olá, Deivide!               │
│  Por onde começamos?            │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🧾  Despesas             │   │
│  │     Quais contas vencem  │   │
│  │     este mês?            │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 💰  Saldo                │   │
│  │     Quanto eu tenho      │   │
│  │     disponível hoje?     │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🎯  Metas                │   │
│  │     Como está meu        │   │
│  │     progresso nas metas? │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

### Estado 2: Card Expandido

Ao clicar num card, ele expande mostrando as perguntas agrupadas por categoria:

```
┌──────────────────────────────────┐
│  🧾  Despesas            [▲]    │
│                                  │
│  ⚡ Urgente                      │
│  • Quais contas vencem hoje?    │
│  • Tenho alguma conta atrasada? │
│  • Tenho alguma dívida vencendo │
│    hoje?                        │
│                                  │
│  📋 Rotina                      │
│  • Quais são minhas despesas    │
│    pendentes este mês?          │
│  • Quanto eu já gastei este mês?│
│  ...                            │
│                                  │
│  💳 Dívidas                     │
│  • Quanto falta para quitar...  │
│  ...                            │
└──────────────────────────────────┘
```

---

## ⚙️ Comportamento

1. **Card clicável** → Expande/recolhe as perguntas do pilar
2. **Pergunta clicável** → Envia o texto via `sendMessage({ text: pergunta.texto })`
3. **Apenas 1 card expandido por vez** → Ao abrir um, fecha o outro
4. **Cards somem após primeira mensagem** → O estado vazio só aparece quando `visibleMessages.length === 0`

---

## 📐 Componentes MUI Recomendados

Usar os componentes já importados no `ChatDrawer.tsx`:

| Elemento | Componente MUI |
|---|---|
| Container dos cards | `Stack` (direction: column, spacing: 2) |
| Cada card | `Box` com `styled()` (como `MessageBubble`) |
| Texto de saudação | `Typography` (variant: body1, fontWeight: 600) |
| Perguntas | `Button` (text, fullWidth, align: left) |
| Ícone de expandir | `IconChevronDown` / `IconChevronUp` do `@tabler/icons-react` |
| Separador de categoria | `Typography` (variant: caption, fontWeight: 600) |

### Animação

Reutilizar a animação `slideUp` já existente no arquivo:

```tsx
animation: `${slideUp} 0.35s ease-out both`,
```

---

## 🔗 Integração com `sendMessage`

A função `sendMessage` já está disponível via `useChat`. Basta chamar:

```tsx
const handlePerguntaClick = (texto: string) => {
  sendMessage({ text: texto });
};
```

---

## 📝 Passo a Passo da Implementação

### Passo 1: Criar arquivo de dados
```
src/core/chat/suggested-questions.ts
```
- Exportar interface `PerguntaSugerida` e `PilarChat`
- Exportar constante `PILARES_CHAT` com todas as perguntas

### Passo 2: Adicionar estado no ChatDrawer
```tsx
const [pilarExpandido, setPilarExpandido] = useState<string | null>(null);
```

### Passo 3: Criar styled components para os cards
```tsx
const PilarCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded?: boolean; cor: string }>(({ theme, isExpanded, cor }) => ({
  // Estilos do card
}));

const PerguntaButton = styled(Button)(({ theme }) => ({
  // Estilos do botão de pergunta
}));
```

### Passo 4: Substituir o estado vazio atual

Substituir o bloco das linhas 428-439 pelo novo JSX:

```tsx
{visibleMessages.length === 0 && !isLoading ? (
  <Box sx={{ px: 2, pt: 2, pb: 1 }}>
    <Typography variant="body1" fontWeight={600} gutterBottom>
      👋 Olá! Por onde começamos?
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Selecione um tema abaixo para ver perguntas sugeridas
    </Typography>

    <Stack spacing={2}>
      {PILARES_CHAT.map((pilar) => (
        <PilarCard
          key={pilar.id}
          cor={pilar.cor}
          isExpanded={pilarExpandido === pilar.id}
          onClick={() =>
            setPilarExpandido(
              pilarExpandido === pilar.id ? null : pilar.id,
            )
          }
        >
          {/* Header do card */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography fontSize={24}>{pilar.icone}</Typography>
              <Box>
                <Typography fontWeight={600}>{pilar.nome}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {pilar.perguntaAncora}
                </Typography>
              </Box>
            </Stack>
            {pilarExpandido === pilar.id ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </Stack>

          {/* Perguntas expandidas */}
          {pilarExpandido === pilar.id && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {Object.entries(
                agruparPorCategoria(pilar.perguntas),
              ).map(([categoria, perguntas]) => (
                <Box key={categoria} sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
                    {formatarCategoria(categoria)}
                  </Typography>
                  {perguntas.map((pergunta, idx) => (
                    <PerguntaButton
                      key={idx}
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePerguntaClick(pergunta.texto);
                      }}
                    >
                      {pergunta.texto}
                    </PerguntaButton>
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </PilarCard>
      ))}
    </Stack>
  </Box>
) : (
```

### Passo 5: Adicionar helpers

```tsx
function agruparPorCategoria(perguntas: PerguntaSugerida[]) {
  return perguntas.reduce((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {} as Record<string, PerguntaSugerida[]>);
}

function formatarCategoria(cat: string): string {
  const map: Record<string, string> = {
    urgente: "⚡ Urgente",
    rotina: "📋 Rotina",
    analise: "📊 Análise",
    dividas: "💳 Dívidas e Parcelamentos",
    comparacao: "🔄 Comparação",
    planejamento: "📅 Planejamento",
    alerta: "⚠️ Alerta",
    progresso: "📈 Progresso",
    conceito: "💡 Conceito",
  };
  return map[cat] || cat;
}
```

### Passo 6: Importar no ChatDrawer

```tsx
import { PILARES_CHAT, agruparPorCategoria, formatarCategoria } from "@/core/chat/suggested-questions";
```

### Passo 7: Adicionar ícone necessário

```tsx
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
```
(Adicionar ao import existente de `@tabler/icons-react`)

---

## 🎨 Paleta de Cores Sugerida

| Pilar | Cor Primária | Background |
|---|---|---|
| Despesas | `#E53E3E` (vermelho) | `rgba(229, 62, 62, 0.08)` |
| Saldo | `#38A169` (verde) | `rgba(56, 161, 105, 0.08)` |
| Metas | `#805AD5` (roxo) | `rgba(128, 90, 213, 0.08)` |

Usar `alpha(cor, 0.08)` para backgrounds e `cor` para bordas/accent.

---

## ✅ Critérios de Aceite

- [ ] 3 cards visíveis na tela vazia do chat
- [ ] Click no card expande/recolhe perguntas
- [ ] Apenas 1 card expandido por vez
- [ ] Click na pergunta envia mensagem ao agente
- [ ] Cards somem após primeira mensagem ser enviada
- [ ] Cards reaparecem se chat for limpo (`handleLimparChat`)
- [ ] Animação suave de expansão
- [ ] Dark mode compatível
- [ ] Responsivo (já que drawer é 400px fixo)
