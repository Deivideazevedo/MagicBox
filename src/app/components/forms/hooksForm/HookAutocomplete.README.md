# HookAutocomplete

Componente Autocomplete do Material-UI integrado com React Hook Form, oferecendo tipagem forte e controle total via props.

## 🎯 Características

- ✅ **Tipagem Forte**: Usa generics do React Hook Form (`Control<TFieldValues>`) sem `any`
- ✅ **Flexível**: Suporta modo simples ou múltiplo
- ✅ **Customizável**: Props para controle total do comportamento
- ✅ **Validação Integrada**: Exibe erros do React Hook Form automaticamente
- ✅ **Performance**: Otimizado para grandes listas de opções
- ✅ **Acessível**: Segue padrões de acessibilidade do MUI

## 📦 Instalação

O componente já está disponível em:
```
src/app/components/forms/hooksForm/HookAutocomplete.tsx
```

## 🚀 Uso Básico

```tsx
import { useForm } from "react-hook-form";
import { HookAutocomplete } from "@/app/components/forms/hooksForm";

type FormData = {
  categoriaId: string;
};

function MeuFormulario() {
  const { control, handleSubmit } = useForm<FormData>();

  const categorias = [
    { id: "1", nome: "Alimentação" },
    { id: "2", nome: "Transporte" },
    { id: "3", nome: "Moradia" },
  ];

  const onSubmit = (data: FormData) => {
    console.log(data); // { categoriaId: "1" }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HookAutocomplete
        name="categoriaId"
        control={control}
        label="Categoria"
        options={categorias}
        getOptionLabel={(cat) => cat.nome}
        getOptionValue={(cat) => cat.id}
      />
      <button type="submit">Salvar</button>
    </form>
  );
}
```

## 📚 Props

### Props Obrigatórias

| Prop | Tipo | Descrição |
|------|------|-----------|
| `name` | `Path<TFieldValues>` | Nome do campo no formulário |
| `control` | `Control<TFieldValues>` | Controle do React Hook Form |
| `options` | `T[]` | Array de opções disponíveis |

### Props Opcionais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | - | Label do campo |
| `placeholder` | `string` | - | Texto de placeholder |
| `getOptionLabel` | `(option: T) => string` | Auto | Função para extrair o label |
| `getOptionValue` | `(option: T) => any` | Auto | Função para extrair o valor |
| `isOptionEqualToValue` | `(option: T, value: T) => boolean` | Auto | Comparação de opções |
| `multiple` | `boolean` | `false` | Permite seleção múltipla |
| `freeSolo` | `boolean` | `false` | Permite digitação livre |
| `disabled` | `boolean` | `false` | Desabilita o campo |
| `loading` | `boolean` | `false` | Mostra indicador de carregamento |
| `textFieldProps` | `TextFieldProps` | - | Props para o TextField interno |

### Todas as props do MUI Autocomplete

O componente aceita todas as props do `Autocomplete` do Material-UI, exceto `renderInput`.

## 💡 Exemplos

### Autocomplete Simples

```tsx
<HookAutocomplete
  name="status"
  control={control}
  label="Status"
  options={["Ativo", "Inativo", "Pendente"]}
/>
```

### Autocomplete Múltiplo

```tsx
<HookAutocomplete
  name="tags"
  control={control}
  label="Tags"
  multiple
  options={tags}
  getOptionLabel={(tag) => tag.nome}
  getOptionValue={(tag) => tag.id}
/>
```

### Com Agrupamento

```tsx
<HookAutocomplete
  name="contaId"
  control={control}
  label="Conta"
  options={contas}
  groupBy={(option) => option.categoria}
  getOptionLabel={(conta) => conta.nome}
  getOptionValue={(conta) => conta.id}
/>
```

### FreeSolo (Digitação Livre)

```tsx
<HookAutocomplete
  name="descricao"
  control={control}
  label="Descrição"
  freeSolo
  options={["Supermercado", "Farmácia", "Restaurante"]}
  placeholder="Digite ou selecione"
/>
```

### Com Props Customizadas

```tsx
<HookAutocomplete
  name="despesaId"
  control={control}
  label="Despesa"
  options={despesas}
  getOptionLabel={(desp) => `${desp.nome} (${desp.categoria})`}
  getOptionValue={(desp) => desp.id}
  textFieldProps={{
    variant: "outlined",
    size: "small",
  }}
  disabled={isLoading}
  loading={isLoading}
  loadingText="Carregando despesas..."
  noOptionsText="Nenhuma despesa encontrada"
/>
```

## 🔍 Como Funciona

### 1. Sincronização com React Hook Form

O componente usa `useController` para sincronizar o estado do Autocomplete com o React Hook Form:

```tsx
const { field, fieldState: { error } } = useController({ name, control });
```

### 2. Conversão de Valores

Se você fornecer `getOptionValue`, o componente salva apenas o valor extraído no formulário:

```tsx
// Opção: { id: "1", nome: "Alimentação" }
// Valor salvo: "1"
getOptionValue={(cat) => cat.id}
```

Se não fornecer, salva o objeto completo:

```tsx
// Valor salvo: { id: "1", nome: "Alimentação" }
```

### 3. Comparação de Opções

O componente compara opções usando `isOptionEqualToValue`. Se não fornecida, usa:

1. `getOptionValue` para comparar valores
2. Ou compara `option.id === value.id`

### 4. Label Padrão

Se não fornecer `getOptionLabel`, o componente tenta:

1. Usar a string diretamente (se for string)
2. Usar `option.label`
3. Usar `option.nome`
4. Usar `option.name`
5. Converter para string

## ⚠️ Observações Importantes

1. **Tipagem**: Sempre use tipagem forte para `control` e evite `any`
2. **Performance**: Para listas grandes (>1000 itens), considere virtualização
3. **Validação**: Use Yup ou Zod para validação no React Hook Form
4. **Múltiplo**: Quando usar `multiple`, o valor do campo será um array

## 🐛 Troubleshooting

### O valor não está sendo salvo

Verifique se `getOptionValue` está retornando o valor correto:

```tsx
getOptionValue={(option) => {
  console.log("Valor extraído:", option.id);
  return option.id;
}}
```

### Opção não está sendo selecionada

Verifique se `isOptionEqualToValue` está comparando corretamente:

```tsx
isOptionEqualToValue={(option, value) => {
  console.log("Comparando:", option, value);
  return option.id === value.id;
}}
```

### Erro de tipagem

Certifique-se de que o tipo do campo no formulário corresponde ao valor retornado:

```tsx
// ❌ Errado
type FormData = {
  categoriaId: number; // mas getOptionValue retorna string
};

// ✅ Correto
type FormData = {
  categoriaId: string;
};
```

## 📖 Veja Também

- [HookTextField](./HookTextField.tsx) - Campo de texto integrado
- [HookSelect](./HookSelect.tsx) - Select integrado
- [HookPasswordField](./HookPasswordField.tsx) - Campo de senha integrado
- [Exemplos Completos](./HookAutocomplete.example.tsx)

## 🤝 Contribuindo

Para melhorias ou correções, siga os padrões do projeto:

1. Mantenha tipagem forte (sem `any`)
2. Adicione comentários explicativos
3. Teste com múltiplos cenários
4. Atualize a documentação
