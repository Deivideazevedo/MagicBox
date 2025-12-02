# HookAutocomplete

Componente Autocomplete integrado com `react-hook-form` usando `useController`. Funciona como o Autocomplete nativo do MUI, mas totalmente conectado ao formulário.

## Importação

```tsx
import HookAutocomplete from '@/app/components/forms/hooksForm/HookAutocomplete';
```

## Props

### Props Obrigatórias

| Prop | Tipo | Descrição |
|------|------|-----------|
| `name` | `Path<T>` | Nome do campo no formulário (react-hook-form) |
| `control` | `Control<T>` | Controle do react-hook-form |
| `options` | `OptionType[]` | Array de opções para seleção |

### Props Específicas

| Prop | Tipo | Descrição |
|------|------|-----------|
| `label` | `string` | Label exibido no campo |
| `placeholder` | `string` | Placeholder do campo |
| `textFieldProps` | `TextFieldProps` | Props adicionais para o TextField interno |
| `getFieldValue` | `(option: OptionType) => any` | Função simples para extrair o valor a ser armazenado: `(option) => option.id` |

### Props do MUI Autocomplete

O componente aceita **todas as props nativas** do MUI Autocomplete:

- `multiple` - Habilita seleção múltipla
- `disabled` - Desabilita o campo
- `loading` - Exibe indicador de carregamento
- `disableClearable` - Remove botão de limpar
- `openOnFocus` - Abre ao focar
- `autoHighlight` - Destaca primeira opção
- `filterSelectedOptions` - Remove opções selecionadas da lista
- `limitTags` - Limita tags visíveis em multiple
- `noOptionsText` - Texto quando não há opções
- `loadingText` - Texto durante carregamento
- `renderOption` - Customiza renderização das opções
- `getOptionLabel` - Customiza label das opções
- `isOptionEqualToValue` - Customiza comparação de opções
- `onChange` - Callback ao mudar valor
- E todas as outras props do [MUI Autocomplete](https://mui.com/material-ui/react-autocomplete/)

## Tipos

### AutocompleteOption

Tipo padrão esperado para as opções:

```tsx
type AutocompleteOption = {
  id: string | number;
  label: string;
  [key: string]: any; // Permite propriedades adicionais
};
```

## Exemplos de Uso

### 1. Uso Básico - Armazena Objeto Completo

```tsx
import { useForm } from 'react-hook-form';
import HookAutocomplete from '@/app/components/forms/hooksForm/HookAutocomplete';

type FormData = {
  pais: { id: number; label: string } | null;
};

const MyForm = () => {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { pais: null },
  });

  const paises = [
    { id: 1, label: 'Brasil' },
    { id: 2, label: 'Estados Unidos' },
    { id: 3, label: 'Portugal' },
  ];

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <HookAutocomplete
        name="pais"
        control={control}
        options={paises}
        label="País"
        placeholder="Selecione um país"
      />
      {/* Ao submeter: data.pais = { id: 1, label: 'Brasil' } */}
    </form>
  );
};
```

### 2. Armazenando Apenas o ID

```tsx
type FormData = {
  paisId: number | null;
};

const MyForm = () => {
  const { control } = useForm<FormData>({
    defaultValues: { paisId: null },
  });

  const paises = [
    { id: 1, label: 'Brasil', continent: 'América do Sul' },
    { id: 2, label: 'Estados Unidos', continent: 'América do Norte' },
  ];

  return (
    <HookAutocomplete
      name="paisId"
      control={control}
      options={paises}
      label="País"
      // Extrai apenas o ID para armazenar
      getFieldValue={(option) => option.id}
      // Define texto de exibição (usa prop nativa do MUI)
      getOptionLabel={(option) => option.continent}
    />
    // Ao submeter: data.paisId = 1
  );
};
```

### 3. Múltipla Seleção

```tsx
type FormData = {
  paisIds: number[];
};

const MyForm = () => {
  const { control } = useForm<FormData>({
    defaultValues: { paisIds: [] },
  });

  return (
    <HookAutocomplete
      name="paisIds"
      control={control}
      options={paises}
      label="Países"
      multiple // Habilita seleção múltipla
      // Extrai ID de cada opção (componente mapeia automaticamente para array)
      getFieldValue={(option) => option.id}
      // Define texto de exibição
      getOptionLabel={(option) => option.continent}
    />
    // Ao submeter: data.paisIds = [1, 2, 3]
  );
};
```

### 4. Com Props Nativas do MUI

```tsx
<HookAutocomplete
  name="categoria"
  control={control}
  options={categorias}
  label="Categoria"
  // Props nativas funcionam todas!
  disableClearable
  autoHighlight
  openOnFocus
  disabled={isLoading}
  loading={isLoading}
  loadingText="Carregando..."
  noOptionsText="Nenhuma categoria encontrada"
  filterSelectedOptions
/>
```

### 5. Renderização Customizada

```tsx
import { Avatar, Box, Typography } from '@mui/material';

<HookAutocomplete
  name="user"
  control={control}
  options={users}
  label="Usuário"
  getOptionLabel={(option) => option.name}
  // Customiza cada item da lista
  renderOption={(props, option) => (
    <Box component="li" {...props} sx={{ display: 'flex', gap: 2 }}>
      <Avatar>{option.name.charAt(0)}</Avatar>
      <Box>
        <Typography variant="body1">{option.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {option.email}
        </Typography>
      </Box>
    </Box>
  )}
/>
```

### 6. Com onChange Customizado

```tsx
<HookAutocomplete
  name="categoria"
  control={control}
  options={categorias}
  label="Categoria"
  // onChange nativo do MUI funciona!
  onChange={(event, value, reason) => {
    console.log('Categoria selecionada:', value);
    console.log('Razão da mudança:', reason);
    // O formulário é atualizado automaticamente
    // Este onChange é para ações extras
  }}
/>
```

### 7. Com Validação (Yup)

```tsx
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  paisId: yup.number().nullable().required('País é obrigatório'),
});

const MyForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: { paisId: null },
  });

  return (
    <HookAutocomplete
      name="paisId"
      control={control}
      options={paises}
      label="País *"
      getFieldValue={(option) => option.id}
      getOptionLabel={(option) => option.label}
      // Mensagens de erro aparecem automaticamente
    />
  );
};
```

### 8. Com Dependência Entre Campos

```tsx
type FormData = {
  categoriaId: number | null;
  subcategoriaId: number | null;
};

const MyForm = () => {
  const { control, watch } = useForm<FormData>();

  const categorias = [
    { id: 1, label: 'Eletrônicos' },
    { id: 2, label: 'Roupas' },
  ];

  const todasSubcategorias = [
    { id: 11, label: 'Celulares', categoriaId: 1 },
    { id: 12, label: 'Notebooks', categoriaId: 1 },
    { id: 21, label: 'Camisetas', categoriaId: 2 },
  ];

  // Observa mudança na categoria
  const categoriaId = watch('categoriaId');

  // Filtra subcategorias
  const subcategorias = todasSubcategorias.filter(
    (sub) => sub.categoriaId === categoriaId
  );

  return (
    <>
      <HookAutocomplete
        name="categoriaId"
        control={control}
        options={categorias}
        label="Categoria *"
        getFieldValue={(option) => option.id}
        getOptionLabel={(option) => option.label}
      />

      <HookAutocomplete
        name="subcategoriaId"
        control={control}
        options={subcategorias}
        label="Subcategoria *"
        disabled={!categoriaId}
        getFieldValue={(option) => option.id}
        getOptionLabel={(option) => option.label}
        noOptionsText={
          categoriaId
            ? 'Nenhuma subcategoria disponível'
            : 'Selecione uma categoria primeiro'
        }
      />
    </>
  );
};
```

### 9. Com API/RTK Query

```tsx
import { useGetCategoriasQuery } from '@/services/endpoints/categoriasApi';

const MyForm = () => {
  const { control } = useForm();
  const { data, isLoading, isError } = useGetCategoriasQuery();

  const categorias = data?.map((cat) => ({
    id: cat.id,
    label: cat.nome,
  })) || [];

  return (
    <HookAutocomplete
      name="categoriaId"
      control={control}
      options={categorias}
      label="Categoria"
      loading={isLoading}
      disabled={isError}
      loadingText="Carregando categorias..."
      noOptionsText={isError ? 'Erro ao carregar' : 'Nenhuma categoria'}
      getFieldValue={(option) => option.id}
      getOptionLabel={(option) => option.label}
    />
  );
};
```

## Comportamentos Padrão

### getOptionLabel

Se não for fornecido, usa:
- `option.label` se existir
- A própria string se for string
- `String(option)` como fallback

### isOptionEqualToValue

Se não for fornecido, compara:
- Por `option.id` se existir em ambos
- Por igualdade estrita (`===`) como fallback

### renderOption (multiple)

Para múltipla seleção, renderiza automaticamente um checkbox antes do label.

## Dicas

1. **Valor padrão**: Sempre defina um `defaultValue` adequado:
   - Single: `null`
   - Multiple: `[]`

2. **Armazenar apenas ID**: Use `getFieldValue={(option) => option.id}` para extrair o valor do formulário

3. **Customizar exibição**: Use a prop nativa `getOptionLabel={(option) => option.propertyName}` do MUI para definir o texto exibido

4. **Validação**: Combine com Yup/Zod para validação robusta

5. **Performance**: Para listas grandes, considere usar `filterOptions` customizado

6. **Acessibilidade**: Sempre use `label` para melhor UX

## Troubleshooting

### Valor não aparece selecionado

Certifique-se que:
- O `defaultValue` corresponde ao tipo esperado
- O `getFieldValue` retorna o valor correto para o formulário
- O `isOptionEqualToValue` compara corretamente

### Erros de validação não aparecem

Verifique se:
- O formulário tem um `resolver` (Yup/Zod)
- O campo está no schema de validação
- O `name` corresponde ao campo do schema

### Opções não aparecem

- Verifique se `options` não está vazio
- Certifique-se que `getOptionLabel` retorna string
- Se usar `loading`, defina `loadingText`
