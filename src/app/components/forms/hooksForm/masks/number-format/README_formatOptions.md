# Propriedades do formatOptions

Este documento descreve as propriedades disponíveis no `formatOptions` dos componentes `HookDecimalField`, `HookCurrencyField` e `HookPercentageField`, baseados na biblioteca `@react-input/number-format`.

## Propriedades Principais

### `locales`
- **Tipo**: `string | string[]`
- **Padrão**: Locale do navegador
- **Descrição**: Define o locale para formatação. Pode ser uma string ou array de strings em ordem de preferência.
- **Exemplo**: `"pt-BR"`, `["pt-BR", "en-US"]`

### `format`
- **Tipo**: `"decimal" | "currency" | "percent" | "unit"`
- **Padrão**: `"decimal"`
- **Descrição**: Define o estilo de formatação a ser usado.

### `currency`
- **Tipo**: `string`
- **Obrigatório**: Quando `format="currency"`
- **Descrição**: Código da moeda ISO 4217 (ex: "BRL", "USD", "EUR").
- **Exemplo**: `"BRL"`

### `currencyDisplay`
- **Tipo**: `"symbol" | "narrowSymbol" | "code" | "name"`
- **Padrão**: `"symbol"`
- **Descrição**: Como exibir a moeda na formatação.
- **Valores**:
  - `"symbol"`: Símbolo da moeda (R$)
  - `"narrowSymbol"`: Símbolo estreito
  - `"code"`: Código da moeda (BRL)
  - `"name"`: Nome completo da moeda

### `unit`
- **Tipo**: `string`
- **Obrigatório**: Quando `format="unit"`
- **Descrição**: Unidade para formatação (ex: "kilometer-per-hour").
- **Exemplo**: `"kilometer-per-hour"`

### `unitDisplay`
- **Tipo**: `"short" | "long" | "narrow"`
- **Padrão**: `"short"`
- **Descrição**: Estilo de formatação da unidade.

## Propriedades de Exibição de Sinal

### `signDisplay`
- **Tipo**: `"auto" | "never" | "always" | "exceptZero"`
- **Padrão**: `"auto"`
- **Descrição**: Quando exibir o sinal do número.
- **Valores**:
  - `"auto"`: Apenas números negativos
  - `"never"`: Nunca exibe sinal
  - `"always"`: Sempre exibe sinal
  - `"exceptZero"`: Exibe sinal exceto para zero

## Propriedades de Agrupamento

### `groupDisplay`
- **Tipo**: `"auto" | boolean`
- **Padrão**: `"auto"`
- **Descrição**: Se deve usar separadores de agrupamento (milhares).

## Propriedades de Dígitos

### `minimumIntegerDigits`
- **Tipo**: `number`
- **Padrão**: `1`
- **Descrição**: Número mínimo de dígitos inteiros. Valores menores serão preenchidos com zeros à esquerda.

### `maximumIntegerDigits`
- **Tipo**: `number`
- **Padrão**: Ilimitado
- **Descrição**: Número máximo de dígitos inteiros.

### `minimumFractionDigits`
- **Tipo**: `number`
- **Padrão**: Varia por formato
- **Descrição**: Número mínimo de dígitos fracionários.
- **Padrões por formato**:
  - `decimal`/`percent`: 0
  - `currency`: Dígitos da unidade menor da moeda (ex: 2 para BRL)

### `maximumFractionDigits`
- **Tipo**: `number`
- **Padrão**: Varia por formato
- **Descrição**: Número máximo de dígitos fracionários.
- **Padrões por formato**:
  - `decimal`: Maior entre `minimumFractionDigits` e 3
  - `currency`: Maior entre `minimumFractionDigits` e dígitos da unidade menor
  - `percent`: Maior entre `minimumFractionDigits` e 0

## Exemplos de Uso

### Campo Decimal Brasileiro
```tsx
<HookDecimalField
  formatOptions={{
    locales: "pt-BR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }}
/>
```

### Campo de Moeda
```tsx
<HookCurrencyField
  formatOptions={{
    locales: "pt-BR",
    currency: "BRL",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }}
/>
```

### Campo de Porcentagem
```tsx
<HookPercentageField
  formatOptions={{
    locales: "pt-BR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }}
/>
```

## Notas Importantes

- A biblioteca é baseada no construtor `Intl.NumberFormat`, portanto a funcionalidade depende do suporte do navegador.
- Para TypeScript, certifique-se de usar a versão mais recente para suporte completo aos tipos.
- As propriedades seguem as especificações do ECMAScript Internationalization API.</content>
<parameter name="filePath">/home/deivide/Documentos/plataforma/Next/MagicBox/README_formatOptions.md