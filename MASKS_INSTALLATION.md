# 🎭 Sistema de Máscaras - MagicBox

Bibliotecas instaladas e componentes criados com sucesso!

## 📦 Bibliotecas Instaladas

✅ **@react-input/number-format** v2.0.3
✅ **@react-input/mask** v2.0.4

## 📁 Estrutura Criada

```
src/app/components/forms/hooksForm/masks/
├── README.md                    # Documentação completa
├── index.ts                     # Exportação central
├── ExemploMascaras.tsx         # Exemplo de uso de todos os componentes
│
├── number-format/              # Máscaras numéricas
│   ├── HookCurrencyField.tsx   # 💰 Moeda (R$ 1.234,56)
│   ├── HookPercentageField.tsx # 📊 Percentual (12,5%)
│   ├── HookDecimalField.tsx    # 🔢 Decimal (1.234,56)
│   └── index.ts
│
└── input-mask/                 # Máscaras de texto
    ├── HookCPFField.tsx        # 🆔 CPF (000.000.000-00)
    ├── HookCNPJField.tsx       # 🏢 CNPJ (00.000.000/0000-00)
    ├── HookCEPField.tsx        # 📮 CEP (00000-000)
    ├── HookPhoneField.tsx      # 📱 Telefone ((00) 00000-0000)
    ├── HookDateField.tsx       # 📅 Data (DD/MM/AAAA)
    ├── HookTimeField.tsx       # ⏰ Hora (HH:MM)
    ├── HookCreditCardField.tsx # 💳 Cartão (0000 0000 0000 0000)
    └── index.ts
```

## 🚀 Como Usar

### Importação Simples

```tsx
import {
  HookCurrencyField,
  HookCPFField,
  HookPhoneField,
  // ... outros componentes
} from "@/app/components/forms/hooksForm";
```

### Exemplo Básico

```tsx
import { useForm } from "react-hook-form";
import { HookCurrencyField, HookCPFField } from "@/app/components/forms/hooksForm";

function MeuFormulario() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
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

      <button type="submit">Enviar</button>
    </form>
  );
}
```

## 📋 Componentes Disponíveis

### Máscaras Numéricas (@react-input/number-format)

| Componente | Descrição | Formato | Valor Retornado |
|------------|-----------|---------|-----------------|
| `HookCurrencyField` | Campo monetário | R$ 1.234,56 | `number` |
| `HookPercentageField` | Campo de percentual | 12,5% | `number` |
| `HookDecimalField` | Campo decimal | 1.234,56 | `number` |

**Props especiais:**
- `locale`: string (padrão: "pt-BR")
- `currency`: string (padrão: "BRL") - apenas para Currency
- `maximumFractionDigits`: number
- `minimumFractionDigits`: number

### Máscaras de Texto (@react-input/mask)

| Componente | Descrição | Máscara | Valor Retornado |
|------------|-----------|---------|-----------------|
| `HookCPFField` | CPF | 000.000.000-00 | `string` |
| `HookCNPJField` | CNPJ | 00.000.000/0000-00 | `string` |
| `HookCEPField` | CEP | 00000-000 | `string` |
| `HookPhoneField` | Telefone | (00) 00000-0000 | `string` |
| `HookDateField` | Data | DD/MM/AAAA | `string` |
| `HookTimeField` | Hora | HH:MM | `string` |
| `HookCreditCardField` | Cartão | 0000 0000 0000 0000 | `string` |

**Props especiais:**
- `isMobile`: boolean (apenas para HookPhoneField) - true para celular (9 dígitos), false para fixo (8 dígitos)

## 🎯 Características

✅ **Integração com React Hook Form**: Todos os componentes funcionam perfeitamente com RHF
✅ **Validação de erros**: Exibe mensagens de erro automaticamente
✅ **TypeScript**: Tipagem completa para segurança de tipo
✅ **MUI Theme**: Integrado com o tema MUI do projeto
✅ **Props do TextField**: Todos aceitam as props padrão do TextField do MUI
✅ **Acessibilidade**: Suporte completo para inputRef e validação

## 📚 Documentação Completa

Consulte o arquivo `README.md` dentro da pasta `masks/` para:
- Exemplos detalhados de cada componente
- Explicação de propriedades
- Guia de validação
- Dicas de uso
- Exemplo completo de formulário

## 🧪 Testando

Foi criado um componente de exemplo em `ExemploMascaras.tsx` com todos os campos implementados. Para usar:

```tsx
import ExemploMascaras from "@/app/components/forms/hooksForm/masks/ExemploMascaras";

// Em alguma página ou componente
<ExemploMascaras />
```

## ✅ Status

- [x] Bibliotecas instaladas
- [x] Estrutura de pastas criada
- [x] Componentes number-format implementados
- [x] Componentes input-mask implementados
- [x] Documentação completa
- [x] Exemplo de uso criado
- [x] Exportações centralizadas
- [x] Zero erros de compilação

## 🎓 Próximos Passos

1. Teste os componentes no seu formulário
2. Adicione validações personalizadas conforme necessário
3. Customize os estilos usando props do MUI TextField
4. Crie novos componentes de máscara seguindo o padrão estabelecido

---

**Desenvolvido para o projeto MagicBox** 🎁
