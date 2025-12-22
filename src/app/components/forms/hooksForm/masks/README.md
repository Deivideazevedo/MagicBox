# Componentes de Máscara com React Hook Form

Este diretório contém componentes de formulário com máscaras integradas ao React Hook Form, organizados por biblioteca.

## Estrutura

```
masks/
├── number-format/          # Máscaras numéricas (@react-input/number-format)
│   ├── HookCurrencyField.tsx      # Moeda (R$ 1.234,56)
│   ├── HookPercentageField.tsx    # Percentual (12,5%)
│   ├── HookDecimalField.tsx       # Decimal (1.234,56)
│   └── index.ts
├── input-mask/             # Máscaras de texto (@react-input/mask)
│   ├── HookCPFField.tsx           # CPF (000.000.000-00)
│   ├── HookCNPJField.tsx          # CNPJ (00.000.000/0000-00)
│   ├── HookCEPField.tsx           # CEP (00000-000)
│   ├── HookPhoneField.tsx         # Telefone ((00) 00000-0000)
│   ├── HookDateField.tsx          # Data (DD/MM/AAAA)
│   ├── HookTimeField.tsx          # Hora (HH:MM)
│   ├── HookCreditCardField.tsx    # Cartão (0000 0000 0000 0000)
│   └── index.ts
└── index.ts                # Exportação central
```

## Bibliotecas Utilizadas

### @react-input/number-format
Formatação de números com localização (moeda, percentual, decimal).

### @react-input/mask
Máscaras de texto personalizadas (CPF, CEP, telefone, etc).

## Como Usar

### 1. Campos Numéricos

#### HookCurrencyField - Moeda
```tsx
import { HookCurrencyField } from "@/app/components/forms/hooksForm/masks";
import { useForm } from "react-hook-form";

function MeuFormulario() {
  const { control } = useForm();

  return (
    <HookCurrencyField
      name="valor"
      control={control}
      label="Valor"
      locale="pt-BR"              // Opcional, padrão: pt-BR
      currency="BRL"              // Opcional, padrão: BRL
      maximumFractionDigits={2}   // Opcional, padrão: 2
      minimumFractionDigits={2}   // Opcional, padrão: 2
    />
  );
}
```

#### HookPercentageField - Percentual
```tsx
<HookPercentageField
  name="taxa"
  control={control}
  label="Taxa"
  locale="pt-BR"              // Opcional, padrão: pt-BR
  maximumFractionDigits={2}   // Opcional, padrão: 2
  minimumFractionDigits={0}   // Opcional, padrão: 0
/>
```

#### HookDecimalField - Decimal
```tsx
<HookDecimalField
  name="quantidade"
  control={control}
  label="Quantidade"
  locale="pt-BR"              // Opcional, padrão: pt-BR
  maximumFractionDigits={2}   // Opcional, padrão: 2
  minimumFractionDigits={0}   // Opcional, padrão: 0
/>
```

### 2. Campos com Máscara de Texto

#### HookCPFField - CPF
```tsx
import { HookCPFField } from "@/app/components/forms/hooksForm/masks";

<HookCPFField
  name="cpf"
  control={control}
  label="CPF"
/>
// Máscara: 000.000.000-00
```

#### HookCNPJField - CNPJ
```tsx
<HookCNPJField
  name="cnpj"
  control={control}
  label="CNPJ"
/>
// Máscara: 00.000.000/0000-00
```

#### HookCEPField - CEP
```tsx
<HookCEPField
  name="cep"
  control={control}
  label="CEP"
/>
// Máscara: 00000-000
```

#### HookPhoneField - Telefone
```tsx
<HookPhoneField
  name="telefone"
  control={control}
  label="Telefone"
  isMobile={true}  // true para celular (9 dígitos), false para fixo (8 dígitos)
/>
// Celular: (00) 00000-0000
// Fixo: (00) 0000-0000
```

#### HookDateField - Data
```tsx
<HookDateField
  name="dataNascimento"
  control={control}
  label="Data de Nascimento"
/>
// Máscara: DD/MM/AAAA
```

#### HookTimeField - Hora
```tsx
<HookTimeField
  name="horario"
  control={control}
  label="Horário"
/>
// Máscara: HH:MM
```

#### HookCreditCardField - Cartão de Crédito
```tsx
<HookCreditCardField
  name="cartao"
  control={control}
  label="Número do Cartão"
/>
// Máscara: 0000 0000 0000 0000
```

## Exemplo Completo

```tsx
import { useForm } from "react-hook-form";
import {
  HookCurrencyField,
  HookCPFField,
  HookPhoneField,
  HookCEPField,
} from "@/app/components/forms/hooksForm/masks";
import { Button, Stack } from "@mui/material";

interface FormData {
  valor: number;
  cpf: string;
  telefone: string;
  cep: string;
}

export function FormularioCompleto() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <HookCurrencyField
          name="valor"
          control={control}
          label="Valor"
          rules={{ required: "Campo obrigatório" }}
        />

        <HookCPFField
          name="cpf"
          control={control}
          label="CPF"
          rules={{ required: "Campo obrigatório" }}
        />

        <HookPhoneField
          name="telefone"
          control={control}
          label="Telefone"
          isMobile={true}
          rules={{ required: "Campo obrigatório" }}
        />

        <HookCEPField
          name="cep"
          control={control}
          label="CEP"
          rules={{ required: "Campo obrigatório" }}
        />

        <Button type="submit" variant="contained">
          Enviar
        </Button>
      </Stack>
    </form>
  );
}
```

## Propriedades Comuns

Todos os componentes herdam as propriedades do `TextField` do MUI e do `useController` do React Hook Form:

### Props do React Hook Form
- `name` (obrigatório): Nome do campo no formulário
- `control` (obrigatório): Controle do React Hook Form
- `rules`: Regras de validação
- `defaultValue`: Valor padrão

### Props do MUI TextField
- `label`: Rótulo do campo
- `placeholder`: Texto de placeholder
- `disabled`: Desabilita o campo
- `required`: Marca como obrigatório
- `helperText`: Texto de ajuda (sobrescrito por erros de validação)
- `error`: Estado de erro (gerenciado automaticamente)
- E todas as outras props do TextField

## Validação

Exemplo com validação:

```tsx
<HookCPFField
  name="cpf"
  control={control}
  label="CPF"
  rules={{
    required: "CPF é obrigatório",
    pattern: {
      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      message: "CPF inválido"
    }
  }}
/>
```

## Armazenamento de Valores

- **Campos numéricos** (Currency, Percentage, Decimal): O valor armazenado é um `number`
- **Campos de máscara** (CPF, CNPJ, CEP, etc): O valor armazenado é uma `string` com a máscara

## Dicas

1. **Campos numéricos**: Use `valueAsNumber` para garantir que o valor seja um número no submit
2. **Validação**: As máscaras não validam automaticamente, adicione regras de validação conforme necessário
3. **Customização**: Todos os componentes aceitam props do MUI TextField para customização visual
4. **Locale**: Para campos numéricos, você pode mudar o locale (ex: "en-US" para formato americano)

## Tecnologias

- React Hook Form
- Material-UI (MUI)
- @react-input/number-format
- @react-input/mask
