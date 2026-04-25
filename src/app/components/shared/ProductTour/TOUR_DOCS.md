# 🎯 ProductTour — Como Funciona, Como Personalizar

> Um sistema de tour guiado reutilizável feito com React + MUI, sem dependências externas.
> Toda a mágica acontece com CSS puro (`box-shadow`, `transition`, `Fade`) e a API nativa `getBoundingClientRect`.

---

## 📂 Mapa dos Arquivos

| Arquivo | O que faz |
|---------|-----------|
| [index.ts](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/index.ts) | Re-exporta tudo (barrel file) |
| [ProductTour.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx) | Componente visual: overlay, spotlight, tooltip  |
| [useTour.ts](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts) | Hook: estado, navegação, persistência no localStorage |
| [DividasTourContext.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx) | Context React que centraliza os refs do tour de dívidas |
| [dividasTourSteps.ts](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/dividasTourSteps.ts) | Os 8 passos explicativos do tour |
| [page.tsx (dívidas)](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/dividas/page.tsx) | Onde tudo é integrado: Provider + Hook + Componente |

---

## 🖥️ As 3 Camadas Visuais

Tudo é renderizado dentro de um `<Portal>` (sai da árvore DOM normal e vai pro `<body>`).
São **3 camadas empilhadas** por z-index:

### Camada 1 — Overlay Escuro com Furo (z-index 9997–9998)

Esse é o truque mais legal. Em vez de criar um overlay com um buraco recortado (que é complexo),
usamos um **único elemento posicionado sobre o alvo**, que é **transparente** — e damos nele um
`box-shadow` **gigante** que cobre toda a tela.

O resultado: o elemento é o "furo", e o box-shadow é o escuro ao redor.

📍 Código em [ProductTour.tsx:L254-L270](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L254-L270):

```tsx
{/* Overlay com furo transparente */}
<Box
  onClick={onSkip}
  sx={{
    position: "fixed",
    top: targetRect.top - SPOTLIGHT_PADDING,      // posiciona sobre o elemento
    left: targetRect.left - SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2,
    borderRadius: 3,
    // ⭐ O SEGREDO: este elemento é transparente = furo.
    // O box-shadow de 9999px cobre todo o resto da tela!
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.55)`,
    zIndex: 9998,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",  // cliques passam direto
  }}
/>
```

Logo abaixo, uma camada invisível de click (z-index 9997) permite fechar o tour ao clicar fora:

📍 Código em [ProductTour.tsx:L272-L280](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L272-L280):

```tsx
{/* Camada de click no overlay */}
<Box
  onClick={onSkip}
  sx={{ position: "fixed", inset: 0, zIndex: 9997 }}
/>
```

---

### Camada 2 — Borda Luminosa Pulsante (z-index 9999)

Um anel azul com animação de pulso que contorna a área destacada:

📍 Código em [ProductTour.tsx:L282-L315](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L282-L315):

```tsx
{/* Borda luminosa no spotlight */}
<Box
  sx={{
    position: "fixed",
    top: targetRect.top - SPOTLIGHT_PADDING,
    left: targetRect.left - SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2,
    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    boxShadow: `
      0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)},
      0 0 24px ${alpha(theme.palette.primary.main, 0.12)}
    `,
    zIndex: 9999,
    pointerEvents: "none",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "tourSpotlightPulse 2.5s ease-in-out infinite",
  }}
/>
```

---

### Camada 3 — Tooltip com Fade (z-index 10000)

O cartão de informações com barra de progresso, título, descrição e botões.
Usa o `<Fade>` do MUI para animação suave:

📍 Código em [ProductTour.tsx:L331-L340](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L331-L340):

```tsx
{/* Tooltip — fade-out com conteúdo antigo, fade-in com conteúdo novo */}
<Fade in={visible} timeout={FADE_DURATION}>
  <Box
    ref={tooltipRef}
    onClick={(e) => e.stopPropagation()}
    sx={{
      position: "fixed",
      ...tooltipStyle,       // top, left, width calculados dinamicamente
      zIndex: 10000,
      transition: "top 0.25s ..., left 0.25s ...",  // move suavemente ao trocar step
    }}
  >
```

---

## 🎞️ O Efeito de "Deslizar" entre Steps

Quando você clica "Próximo", acontece isso em sequência:

```
Clica "Próximo"
  │
  ├─ 1. O step muda (currentStep + 1)
  │     mas o conteúdo do tooltip NÃO muda ainda (displayedStep continua o antigo)
  │
  ├─ 2. visible = false → Fade faz exit (180ms) com o conteúdo ANTIGO
  │     Enquanto isso, o overlay/borda JÁ DESLIZAM para o novo elemento
  │     (porque usam targetRect que muda imediatamente, com transition CSS de 0.25s)
  │
  ├─ 3. Após 180ms (fade-out termina):
  │     → displayedStep = step novo (conteúdo troca, mas está invisível)
  │     → updatePosition() recalcula posição do tooltip
  │
  └─ 4. visible = true → Fade faz enter (180ms) com o conteúdo NOVO na posição certa
```

O segredo está nesse trecho — o `displayedStep` que **atrasa** o conteúdo:

📍 Código em [ProductTour.tsx:L50-L54](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L50-L54):

```tsx
// Conteúdo "atrasado": só atualiza APÓS o fade-out terminar
const [displayedStep, setDisplayedStep] = useState(step);
const [displayedCurrentStep, setDisplayedCurrentStep] = useState(currentStep);
const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const FADE_DURATION = 180;
```

E a lógica de transição que orquestra tudo:

📍 Código em [ProductTour.tsx:L169-L205](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L169-L205):

```tsx
// Fluxo de transição entre steps:
// 1. Fade-out com conteúdo ANTIGO
// 2. Após fade-out terminar → atualiza conteúdo para o NOVO
// 3. Reposiciona → Fade-in com conteúdo NOVO
useEffect(() => {
  if (!isOpen || !step) return;

  // Se é o primeiro render, mostra direto
  if (!displayedStep) {
    setDisplayedStep(step);
    setDisplayedCurrentStep(currentStep);
    updatePosition();
    return;
  }

  // Step mudou: inicia fade-out com conteúdo ANTIGO
  setVisible(false);

  // Após o fade-out terminar, troca o conteúdo e reposiciona
  fadeOutTimerRef.current = setTimeout(() => {
    setDisplayedStep(step);           // ← aqui o conteúdo troca!
    setDisplayedCurrentStep(currentStep);
    updatePosition();                 // ← para posicionar e mostrar (visible = true)
  }, FADE_DURATION);
}, [step, currentStep, isOpen]);
```

> 💡 É por isso que o overlay **desliza suavemente** de um canto ao outro sem sumir: ele usa `transition: all 0.25s` e apenas muda `top/left/width/height`. O CSS faz a interpolação visual automaticamente!

---

## 🧠 Como Funciona o Context (Refs Compartilhados)

O tour precisa apontar o spotlight para elementos que estão em **componentes diferentes** (Dashboard, Listagem, etc). Para isso usamos um React Context que centraliza os refs:

### 1. O Context é criado com um ref para cada elemento que queremos destacar

📍 Código em [DividasTourContext.tsx:L5-L13](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx#L5-L13):

```tsx
export interface DividasTourRefs {
  resumoRef: MutableRefObject<HTMLElement | null>;
  acoesRef: MutableRefObject<HTMLElement | null>;
  cardRef: MutableRefObject<HTMLElement | null>;
  chipTipoRef: MutableRefObject<HTMLElement | null>;
  progressoRef: MutableRefObject<HTMLElement | null>;
  menuRef: MutableRefObject<HTMLElement | null>;
  boasVindasRef: MutableRefObject<HTMLElement | null>; // sempre null, step sem target
}
```

### 2. O Provider cria os `useRef()` e os disponibiliza para toda a árvore

📍 Código em [DividasTourContext.tsx:L17-L33](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx#L17-L33):

```tsx
export const DividasTourProvider = ({ children }) => {
  const refs: DividasTourRefs = {
    resumoRef: useRef(null),
    acoesRef: useRef(null),
    cardRef: useRef(null),
    chipTipoRef: useRef(null),
    progressoRef: useRef(null),
    menuRef: useRef(null),
    boasVindasRef: useRef(null),
  };

  return (
    <DividasTourContext.Provider value={refs}>
      {children}
    </DividasTourContext.Provider>
  );
};
```

### 3. O hook de consumo valida se estamos dentro do Provider

📍 Código em [DividasTourContext.tsx:L35-L41](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx#L35-L41):

```tsx
export const useDividasTourRefs = (): DividasTourRefs => {
  const ctx = useContext(DividasTourContext);
  if (!ctx) {
    throw new Error("useDividasTourRefs deve ser usado dentro de <DividasTourProvider>");
  }
  return ctx;
};
```

> ⚠️ Se um componente chamar `useDividasTourRefs()` fora do `<DividasTourProvider>`, um erro claro é lançado. Isso evita bugs silenciosos.

### 4. Os componentes filhos consomem e atribuem os refs

No [DividasDashboard.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasDashboard.tsx):
```tsx
const tourRefs = useDividasTourRefs();

<Grid ref={tourRefs.resumoRef} ...>    {/* Painel de resumo */}
<Stack ref={tourRefs.acoesRef} ...>    {/* Botões de ação */}
```

Na [Listagem.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/Listagem.tsx):
```tsx
const tourRefs = useDividasTourRefs();

<Card ref={index === 0 ? tourRefs.cardRef : undefined} ...>       {/* Primeiro card */}
<Chip ref={index === 0 ? tourRefs.chipTipoRef : undefined} ...>   {/* Chip de tipo */}
<Box ref={index === 0 ? tourRefs.progressoRef : undefined} ...>   {/* Barra de progresso */}
<IconButton ref={index === 0 ? tourRefs.menuRef : undefined} ...> {/* Menu ⋮ */}
```

> 💡 Note o `index === 0` — só atribuímos o ref no **primeiro item** da lista. O tour destaca apenas um card como exemplo.

---

## ⚙️ Tempos e Como Ajustar

Todos os valores estão no [ProductTour.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx):

| O quê | Onde no código | Valor | Efeito |
|-------|---------------|-------|--------|
| [SPOTLIGHT_PADDING](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L30) | Linha 30 | `10px` | Respiro entre o spotlight e o elemento |
| [TOOLTIP_GAP](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L31) | Linha 31 | `14px` | Distância entre spotlight e tooltip |
| [FADE_DURATION](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L54) | Linha 54 | `180ms` | Duração do fade in/out do tooltip |
| Scroll wait | [Linha 166](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L166) | `250ms` | Tempo esperando scroll terminar |
| Spotlight transition | [Linha 267](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L267) | `0.25s` | Velocidade do deslizar do spotlight |
| Tooltip transition | [Linha 340](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L340) | `0.25s` | Velocidade do mover do tooltip |
| Pulse animation | [Linha 299](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L299) | `2.5s` | Ciclo da pulsação da borda |
| Auto-start delay | [useTour.ts:L33](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts#L33) | `1200ms` | Delay antes de iniciar na 1ª visita |

### 🐌 Quer mais lento e suave?
```
FADE_DURATION → 350      Scroll wait → 500      Transitions → 0.5s
```

### ⚡ Quer mais rápido e ágil?
```
FADE_DURATION → 120      Scroll wait → 150      Transitions → 0.15s
```

---

## 📐 Placement do Tooltip

Você pode dizer onde o tooltip deve aparecer em relação ao elemento:

```
        ┌──────────┐
        │   top    │
        └──────────┘
             ↑
  ┌──────┐ ┌─────────┐ ┌───────┐
  │ left │ │ ELEMENTO│ │ right │
  └──────┘ └─────────┘ └───────┘
             ↓
        ┌──────────┐
        │ bottom   │
        └──────────┘
```

### Exemplo: forçar o tooltip à direita no passo 5

📍 Código em [dividasTourSteps.ts:L64-L79](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/dividasTourSteps.ts#L64-L79):

```tsx
// 4 - Chip de tipo (Única vs Variável)
{
  ref: refs.chipTipoRef,
  title: "🏷️ Única vs Variável — qual a diferença?",
  description: `...`,
  placement: "right",   // ← tooltip aparece à DIREITA do chip
},
```

### A lógica de posicionamento com fallback

📍 Código em [ProductTour.tsx:L56-L138](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L56-L138):

```tsx
// Em mobile, força top/bottom mesmo se o step pede left/right
const effectivePlacement = (isMobile && (placement === "left" || placement === "right"))
  ? undefined       // ← ignora o placement em telas pequenas
  : placement;

// --- Tenta o placement solicitado ---
if (effectivePlacement === "right" && spaceRight >= tooltipWidth + TOOLTIP_GAP) {
  left = rect.right + SPOTLIGHT_PADDING + TOOLTIP_GAP;
  top = rect.top + rect.height / 2 - tooltipHeight / 2;
} else if (...) {
  // tenta left, top, bottom...
} else {
  // Fallback automático: abaixo > acima > onde tem mais espaço
}
```

| Valor | Desktop | Mobile (< 768px) |
|-------|---------|------------------|
| `"right"` | À direita do elemento | **Fallback** para top/bottom |
| `"left"` | À esquerda | **Fallback** para top/bottom |
| `"top"` | Acima | Acima |
| `"bottom"` | Abaixo | Abaixo |
| `undefined` | Auto: abaixo > acima | Auto: abaixo > acima |

---

## 📱 Responsividade

### O que acontece no scroll?

📍 Código em [ProductTour.tsx:L207-L227](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L207-L227):

```tsx
// Recalcula no resize e scroll
useEffect(() => {
  const handleUpdate = () => {
    requestAnimationFrame(() => {       // ← evita jank
      const rect = step.ref.current.getBoundingClientRect();
      setTargetRect(rect);              // ← spotlight acompanha o elemento
      positionTooltip(rect, step.placement);  // ← tooltip reposiciona
    });
  };
  window.addEventListener("resize", handleUpdate);
  window.addEventListener("scroll", handleUpdate, true);  // true = capture mode
  // ...
}, [isOpen, step, positionTooltip]);
```

> 💡 O `true` no `addEventListener("scroll", ..., true)` é essencial — ele captura scroll de **qualquer** container, não só o `window`.

### Proteções de tela

📍 Na [positionTooltip](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L130-L137):

```tsx
// Largura máxima: 400px ou a tela - 32px
const tooltipWidth = Math.min(400, window.innerWidth - 32);

// Clamp para não sair da tela (16px de margem em cada borda)
left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
```

---

## ⌨️ Atalhos de Teclado

📍 Código em [ProductTour.tsx:L229-L239](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/ProductTour.tsx#L229-L239):

```tsx
useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onSkip();                       // Esc = pular tour
    if (e.key === "ArrowRight" || e.key === "Enter") onNext(); // → ou Enter = próximo
    if (e.key === "ArrowLeft") onPrev();                    // ← = anterior
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onNext, onPrev, onSkip]);
```

| Tecla | Ação |
|-------|------|
| `→` ou `Enter` | Próximo step |
| `←` | Step anterior |
| `Escape` | Pular tour |

---

## 🔄 O Hook `useTour` — Persistência e Navegação

📍 Arquivo: [useTour.ts](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts)

### Auto-start na primeira visita

📍 [useTour.ts:L27-L37](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts#L27-L37):

```tsx
// Verifica se o tour já foi visto
useEffect(() => {
  if (autoStart && typeof window !== "undefined") {
    const alreadySeen = localStorage.getItem(storageKey);
    if (!alreadySeen && steps.length > 0) {
      // Delay para garantir que os elementos estejam renderizados
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }
}, [autoStart, storageKey, steps.length]);
```

### Ao concluir ou pular, marca no localStorage

📍 [useTour.ts:L44-L65](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts#L44-L65):

```tsx
const next = useCallback(() => {
  if (currentStep < steps.length - 1) {
    setCurrentStep((prev) => prev + 1);
  } else {
    // Último passo: fechar e marcar como visto
    setIsOpen(false);
    localStorage.setItem(storageKey, "true");  // ← persiste!
  }
}, [...]);

const skip = useCallback(() => {
  setIsOpen(false);
  localStorage.setItem(storageKey, "true");    // ← persiste ao pular também
}, [storageKey]);
```

### Reset (remove a flag para o tour aparecer novamente)

📍 [useTour.ts:L67-L70](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/components/shared/ProductTour/useTour.ts#L67-L70):

```tsx
const reset = useCallback(() => {
  localStorage.removeItem(storageKey);
  setCurrentStep(0);
}, [storageKey]);
```

---

## 🧩 Como Implementar em Outro Módulo (ex: Metas)

### Passo 1 — Criar o Context de Refs

Crie um arquivo parecido com o [DividasTourContext.tsx](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx):

```tsx
// src/.../Meta/MetasTourContext.tsx
"use client";
import React, { createContext, useContext, useRef, MutableRefObject } from "react";

export interface MetasTourRefs {
  resumoRef: MutableRefObject<HTMLElement | null>;
  cardRef: MutableRefObject<HTMLElement | null>;
  boasVindasRef: MutableRefObject<HTMLElement | null>;
}

const MetasTourContext = createContext<MetasTourRefs | null>(null);

export const MetasTourProvider = ({ children }: { children: React.ReactNode }) => {
  const refs: MetasTourRefs = {
    resumoRef: useRef(null),
    cardRef: useRef(null),
    boasVindasRef: useRef(null),
  };
  return <MetasTourContext.Provider value={refs}>{children}</MetasTourContext.Provider>;
};

export const useMetasTourRefs = () => {
  const ctx = useContext(MetasTourContext);
  if (!ctx) throw new Error("useMetasTourRefs fora do Provider!");
  return ctx;
};
```

### Passo 2 — Definir os Steps

Parecido com [dividasTourSteps.ts](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/dividasTourSteps.ts):

```tsx
// src/.../Meta/metasTourSteps.ts
import { TourStep } from "@/app/components/shared/ProductTour";
import { MetasTourRefs } from "./MetasTourContext";

export const criarMetasTourSteps = (refs: MetasTourRefs): TourStep[] => [
  {
    ref: refs.boasVindasRef,
    title: "🎯 Bem-vindo às Metas!",
    description: "Aqui você acompanha seus objetivos...",
  },
  {
    ref: refs.resumoRef,
    title: "📊 Visão geral",
    description: "...",
    placement: "bottom",
  },
  {
    ref: refs.cardRef,
    title: "💰 Sua meta",
    description: "...",
    placement: "right",    // ← tooltip à direita no desktop
  },
];
```

### Passo 3 — Atribuir os Refs nos Componentes

```tsx
const tourRefs = useMetasTourRefs();

<Card ref={tourRefs.cardRef}>...</Card>
<Grid ref={tourRefs.resumoRef}>...</Grid>
```

### Passo 4 — Integrar na Página

Parecido com a [page.tsx de dívidas](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/dividas/page.tsx):

```tsx
import { MetasTourProvider, useMetasTourRefs } from ".../MetasTourContext";
import { criarMetasTourSteps } from ".../metasTourSteps";
import { ProductTour, useTour } from "@/app/components/shared/ProductTour";

function MetasPageContent() {
  const tourRefs = useMetasTourRefs();
  const steps = useMemo(() => criarMetasTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({ storageKey: "tour-metas-visto", steps, autoStart: true });

  return (
    <>
      {/* ... conteúdo ... */}
      <ProductTour
        isOpen={tour.isOpen}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
    </>
  );
}

// ← O Provider DEVE envolver o conteúdo!
export default function MetasPage() {
  return (
    <MetasTourProvider>
      <MetasPageContent />
    </MetasTourProvider>
  );
}
```

---

## 🔧 Manutenção Rápida

| Quero... | O que fazer |
|----------|------------|
| **Adicionar step** | 1. Criar ref no [Context](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/DividasTourContext.tsx) → 2. Atribuir no componente → 3. Adicionar no [array de steps](file:///home/deivide/Documentos/projetos/MagicBox/Magic/src/app/(Private)/cadastros/components/Divida/dividasTourSteps.ts) |
| **Remover step** | Remover do array de steps (opcionalmente remover o ref) |
| **Mudar a ordem** | Reordenar os objetos no array |
| **Resetar para todos** | Mudar a `storageKey` (ex: `"v2"` → `"v3"`) |
| **Forçar reexibição (dev)** | `localStorage.removeItem("tour-dividas-visto-v2")` |
| **Mudar posição do tooltip** | Alterar `placement` no step desejado |
| **Deixar mais rápido** | Reduzir `FADE_DURATION`, scroll wait e transitions |
