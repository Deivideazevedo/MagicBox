# 🎯 Retorno de Valores: String vs Number

## Campos Numéricos com Opção de Retorno

Todos os campos numéricos (`HookCurrencyField`, `HookPercentageField`, `HookDecimalField`) agora possuem a propriedade `returnAsNumber` que permite escolher o tipo de retorno:

### Propriedade `returnAsNumber`

- **`false` (padrão)**: Retorna o valor formatado como **string**
- **`true`**: Retorna o valor numérico como **number**

## Exemplos de Uso

### Retornando como STRING (padrão)

```tsx
<HookCurrencyField
  name="valor"
  control={control}
  label="Valor"
  returnAsNumber={false}  // ou omita (é o padrão)
/>

// Valor retornado: "R$ 1.234,56" (string)
```

### Retornando como NUMBER

```tsx
<HookCurrencyField
  name="valor"
  control={control}
  label="Valor"
  returnAsNumber={true}
/>

// Valor retornado: 1234.56 (number)
```

## Quando Usar Cada Opção?

### Use `returnAsNumber={false}` (STRING) quando:
- ✅ Você precisa salvar o valor já formatado no banco de dados
- ✅ Quer exibir o valor formatado em relatórios sem processamento adicional
- ✅ Precisa manter o formato visual do usuário
- ✅ Vai enviar para uma API que espera string formatada

### Use `returnAsNumber={true}` (NUMBER) quando:
- ✅ Precisa fazer cálculos matemáticos com o valor
- ✅ Vai armazenar em um campo numérico no banco de dados
- ✅ Precisa comparar valores numericamente
- ✅ Sua API espera um tipo `number`

## Exemplos Comparativos

```tsx
interface FormData {
  valorString: string;   // Para formato visual
  valorNumber: number;   // Para cálculos
}

function MeuForm() {
  const { control } = useForm<FormData>();

  return (
    <>
      {/* STRING: "R$ 1.234,56" */}
      <HookCurrencyField
        name="valorString"
        control={control}
        label="Valor (String)"
        returnAsNumber={false}
      />

      {/* NUMBER: 1234.56 */}
      <HookCurrencyField
        name="valorNumber"
        control={control}
        label="Valor (Number)"
        returnAsNumber={true}
      />
    </>
  );
}
```

## Máscaras de Texto

Os campos de máscara de texto **sempre retornam string** com a formatação aplicada:

```tsx
<HookCPFField name="cpf" control={control} />
// Retorna: "123.456.789-00" (string)

<HookPhoneField name="telefone" control={control} />
// Retorna: "(11) 98765-4321" (string)

<HookCEPField name="cep" control={control} />
// Retorna: "12345-678" (string)
```

## 🧪 Testando

Acesse a página de teste para ver a diferença na prática:

```
/teste/mascaras
```

Esta página mostra lado a lado:
- Campos retornando STRING
- Campos retornando NUMBER
- Máscaras de texto
- Valores em tempo real
- Console log com tipos dos dados

## Tabela de Referência Rápida

| Campo | returnAsNumber | Exemplo de Entrada | Valor Retornado | Tipo |
|-------|----------------|-------------------|-----------------|------|
| HookCurrencyField | `false` | R$ 1.234,56 | "R$ 1.234,56" | string |
| HookCurrencyField | `true` | R$ 1.234,56 | 1234.56 | number |
| HookPercentageField | `false` | 12,5% | "12,5%" | string |
| HookPercentageField | `true` | 12,5% | 0.125 | number |
| HookDecimalField | `false` | 1.234,56 | "1.234,56" | string |
| HookDecimalField | `true` | 1.234,56 | 1234.56 | number |
| HookCPFField | N/A | 123.456.789-00 | "123.456.789-00" | string |
| HookPhoneField | N/A | (11) 98765-4321 | "(11) 98765-4321" | string |
| HookCEPField | N/A | 12345-678 | "12345-678" | string |

## Dicas Importantes

1. **Validação**: Independente do tipo de retorno, a máscara visual permanece a mesma
2. **Performance**: Não há diferença de performance entre string e number
3. **Conversão**: Se precisar converter depois, use:
   - String → Number: `parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.'))`
   - Number → String: Use o próprio componente com `returnAsNumber={false}`
4. **TypeScript**: O tipo do formulário deve corresponder ao valor esperado

## Migrando Código Existente

Se você já estava usando os componentes:

### Antes (sempre retornava number):
```tsx
<HookCurrencyField name="valor" control={control} />
// Retornava: 1234.56 (number)
```

### Agora (padrão é string):
```tsx
// Para manter comportamento anterior (number):
<HookCurrencyField 
  name="valor" 
  control={control} 
  returnAsNumber={true}  // ⬅️ Adicione isso
/>

// Ou use o novo padrão (string):
<HookCurrencyField name="valor" control={control} />
// Retorna: "R$ 1.234,56"
```

---

**💡 Recomendação**: Use `returnAsNumber={true}` para campos de cálculo e `returnAsNumber={false}` (padrão) para campos de exibição.
