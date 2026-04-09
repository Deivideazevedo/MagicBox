# Documentação Técnica: Sistema de Filtros de Lançamentos

Esta documentação detalha o funcionamento técnico da filtragem de lançamentos, desde a interface do usuário até o disparo de requisições ao servidor.

---

## 1. Fluxo de Reatividade (Hook Form -> API)

O sistema utiliza uma abordagem reativa onde o estado visual do formulário de filtros está sempre em sincronia com os dados exibidos na tabela.

### O Papel do `watch()`
No componente [components/FiltrosAvancados.tsx](components/FiltrosAvancados.tsx), utilizamos a função `watch()` do `react-hook-form` para observar as mudanças em **todos** os campos do formulário simultaneamente através de um `useEffect`.

```typescript
// Extraído de components/FiltrosAvancados.tsx
const formValues = watch();

useEffect(() => {
  const novosFiltros = onConvert(formValues);
  
  // Verifica se houve mudança real nos filtros para evitar loops infinitos
  const mudou = novosFiltros.dataInicio !== filtros.dataInicio || ...;

  if (!mudou) return;

  handleSearch(novosFiltros);
}, [formValues, filtros]);
```

### Integração com RTK Query
A função `handleSearch` (definida no hook [hooks/useLancamentosList.ts](hooks/useLancamentosList.ts)) atualiza o estado local `filtros`. Como o hook do RTK Query é reativo, ele dispara a busca automaticamente.

```typescript
// Extraído de hooks/useLancamentosList.ts
const [filtros, setFiltros] = useState<FindAllFilters>(/* ... */);

// A query reage a qualquer mudança no estado 'filtros'
const { data, isLoading } = useGetLancamentosQuery(filtros);

const handleSearch = (novosFiltros: Partial<FindAllFilters>) => {
  setFiltros(prev => ({ ...prev, ...novosFiltros }));
};
```

---

## 2. A Opção "Todos / Todas"

Diferente de sistemas que enviam strings como "ALL", nossa implementação utiliza o conceito de **Filtro Opcional via Undefined**.

### Lógica de Conversão (`onConvert`)
Quando um usuário seleciona "Todas" ou limpa um campo, o valor no formulário torna-se `""` ou `null`. A função `onConvert` trata isso para que a API ignore o campo.

```typescript
// Extraído de components/FiltrosAvancados.tsx
const onConvert = (rawFilters: FiltrosLancamentos): Partial<FindAllFilters> => {
  return {
    ...rest,
    tipo: tipo || undefined,                // "" vira undefined
    categoriaId: rawFilters.categoriaId || undefined, // null vira undefined
    observacao: rest.observacao || undefined // "" vira undefined
  };
};
```

**Por que `undefined`?** No JavaScript, ao enviar um objeto para uma API, campos com `undefined` são geralmente removidos na serialização JSON, fazendo com que o backend receba apenas os filtros que realmente devem ser aplicados.

---

## 3. Gestão de Filtros Ativos

O sistema permite adicionar e remover filtros dinamicamente. Isso é controlado pelo estado `filtrosAtivos`.

```typescript
// Extraído de components/FiltrosAvancados.tsx
const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroKey[]>([]);

const removerFiltro = (key: FiltroKey) => {
  setFiltrosAtivos(prev => prev.filter(k => k !== key));
  
  // Reseta o valor no formulário para o padrão ao remover a "tag"
  if (key === "categoriaId") setValue("categoriaId", null);
  else if (key === "origem") setValue("origem", "");
  // ...
};
```

---

## 4. Otimização com Debounce

Para filtros de texto livre, evitamos sobrecarregar o servidor disparando buscas a cada tecla.

```typescript
// Extraído de components/FiltrosAvancados.tsx
const handleSearchDebounced = useCallback(
  debounce((data: FiltrosLancamentos) => {
    handleSearch(onConvert(data));
  }, 500),
  [handleSearch, onConvert]
);

// No useEffect, se a observação mudou, usamos o debounce
if (formValues.observacao !== filtros.observacao) {
  handleSearchDebounced(formValues);
}
```

---

## 5. Seletor de Período Especializado

O componente [components/SeletorPeriodo.tsx](components/SeletorPeriodo.tsx) gerencia a navegação temporal de forma isolada.

### Reset ao Selecionar Tipo
Sempre que o usuário troca o tipo de período (ex: de Mês para Semana), o componente aponta para o tempo **atual**.

```typescript
// Extraído de components/SeletorPeriodo.tsx
<MenuItem
  onClick={() => {
    onTipoChange(opcao.value);
    // 'calcularPeriodo' gera dataInicio/dataFim baseados no 'new Date()'
    onChange(calcularPeriodo(opcao.value, new Date()));
    setAnchorEl(null);
  }}
>
```
