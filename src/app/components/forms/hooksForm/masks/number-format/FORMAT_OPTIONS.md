# 📊 Guia Completo: NumberFormatOptions

Documentação completa das propriedades de formatação numérica disponíveis nos componentes `HookDecimalField`, `HookCurrencyField` e `HookPercentageField`.

---

## 🌍 locales

**Tipo:** `string | string[]`  
**Padrão:** `"pt-BR"`

Define a localização para formatação de números conforme convenções regionais.

### 📝 Exemplos:

| Locale | Valor | Saída |
|--------|-------|-------|
| `"pt-BR"` | 1234.56 | `1.234,56` |
| `"en-US"` | 1234.56 | `1,234.56` |
| `"de-DE"` | 1234.56 | `1.234,56` |
| `"fr-FR"` | 1234.56 | `1 234,56` |
| `["ban", "id"]` | 1234.56 | `1.234,56` (fallback) |

```tsx
<HookDecimalField formatOptions={{ locales: "en-US" }} />
```

---

## 🎯 format

**Tipo:** `"currency" | "decimal" | "percent" | "unit"`  
**Padrão:** `"decimal"`

Define o tipo de formatação numérica a ser aplicada.

### 📝 Exemplos:

| Format | Valor | Saída |
|--------|-------|-------|
| `"decimal"` | 1234.56 | `1.234,56` |
| `"currency"` | 1234.56 | `R$ 1.234,56` |
| `"percent"` | 0.5 | `50%` |
| `"unit"` | 25 | `25 km` (com unit: "kilometer") |

```tsx
<HookCurrencyField formatOptions={{ format: "currency", currency: "USD" }} />
<HookDecimalField formatOptions={{ format: "decimal" }} />
<HookPercentageField formatOptions={{ format: "percent" }} />
```

---

## 💰 currency

**Tipo:** `string` (código ISO 4217)  
**Requer:** `format: "currency"`

Define a moeda para formatação monetária.

### 📝 Exemplos:

| Currency | Valor | Saída |
|----------|-------|-------|
| `"BRL"` | 100 | `R$ 100,00` |
| `"USD"` | 100 | `US$ 100,00` |
| `"EUR"` | 100 | `€ 100,00` |
| `"JPY"` | 100 | `JP¥ 100` |
| `"GBP"` | 100 | `£ 100,00` |

```tsx
<HookCurrencyField 
  formatOptions={{ 
    format: "currency", 
    currency: "EUR" 
  }} 
/>
```

---

## 💵 currencyDisplay

**Tipo:** `"symbol" | "narrowSymbol" | "code" | "name"`  
**Padrão:** `"symbol"`  
**Requer:** `format: "currency"`

Define como o símbolo/código da moeda será exibido.

### 📝 Exemplos (100 USD):

| currencyDisplay | Saída |
|-----------------|-------|
| `"symbol"` | `US$ 100,00` |
| `"narrowSymbol"` | `$ 100,00` |
| `"code"` | `USD 100,00` |
| `"name"` | `100,00 dólares americanos` |

```tsx
<HookCurrencyField 
  formatOptions={{ 
    format: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol" 
  }} 
/>
```

---

## 📏 unit

**Tipo:** `UnitIdentifier` (100+ unidades compatíveis)  
**Requer:** `format: "unit"`

Define a unidade de medida suportada pelo `Intl.NumberFormat` dos navegadores modernos.

> ⚠️ **Importante:** Apenas unidades testadas e compatíveis com `Intl.NumberFormat` são incluídas. Unidades como `day-person`, `month-person`, `century`, etc., não são suportadas pelos navegadores.

### 📝 Categorias e Exemplos:

#### 🏃 Comprimento
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"meter"` | 10 | `10 m` | `10 metros` |
| `"kilometer"` | 5 | `5 km` | `5 quilômetros` |
| `"mile"` | 3 | `3 mi` | `3 milhas` |

#### ⚖️ Massa
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"gram"` | 500 | `500 g` | `500 gramas` |
| `"kilogram"` | 2 | `2 kg` | `2 quilogramas` |
| `"pound"` | 10 | `10 lb` | `10 libras` |

#### 🌡️ Temperatura
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"celsius"` | 25 | `25 °C` | `25 graus Celsius` |
| `"fahrenheit"` | 77 | `77 °F` | `77 graus Fahrenheit` |
| `"kelvin"` | 300 | `300 K` | `300 kelvins` |

#### ⚡ Velocidade
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"kilometer-per-hour"` | 60 | `60 km/h` | `60 quilômetros por hora` |
| `"meter-per-second"` | 10 | `10 m/s` | `10 metros por segundo` |
| `"mile-per-hour"` | 55 | `55 mph` | `55 milhas por hora` |

#### 💧 Volume
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"liter"` | 2 | `2 L` | `2 litros` |
| `"milliliter"` | 500 | `500 ml` | `500 mililitros` |
| `"gallon"` | 5 | `5 gal` | `5 galões` |

#### ⏱️ Duração
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"millisecond"` | 500 | `500 ms` | `500 milissegundos` |
| `"second"` | 45 | `45 s` | `45 segundos` |
| `"minute"` | 30 | `30 min` | `30 minutos` |
| `"hour"` | 2 | `2 h` | `2 horas` |
| `"day"` | 7 | `7 d` | `7 dias` |
| `"week"` | 2 | `2 sem.` | `2 semanas` |
| `"month"` | 3 | `3 meses` | `3 meses` |
| `"year"` | 5 | `5 anos` | `5 anos` |

#### 📦 Área
| Unit | Valor | Saída (short) | Saída (long) |
|------|-------|---------------|--------------|
| `"square-meter"` | 100 | `100 m²` | `100 metros quadrados` |
| `"hectare"` | 5 | `5 ha` | `5 hectares` |
| `"acre"` | 10 | `10 ac` | `10 acres` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    format: "unit",
    unit: "kilometer",
    unitDisplay: "long"
  }} 
/>
```

---

## 📐 unitDisplay

**Tipo:** `"short" | "long" | "narrow"`  
**Padrão:** `"short"`  
**Requer:** `format: "unit"`

Define como a unidade será exibida.

### 📝 Exemplos (5 kilometers):

| unitDisplay | Saída |
|-------------|-------|
| `"short"` | `5 km` |
| `"long"` | `5 quilômetros` |
| `"narrow"` | `5km` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    format: "unit",
    unit: "meter",
    unitDisplay: "narrow"
  }} 
/>
```

---

## ➕➖ signDisplay

**Tipo:** `"auto" | "always" | "exceptZero" | "negative" | "never"`  
**Padrão:** `"auto"`

Controla quando o sinal (+/-) será exibido.

### 📝 Exemplos:

| signDisplay | +10 | -10 | 0 |
|-------------|-----|-----|---|
| `"auto"` | `10` | `-10` | `0` |
| `"always"` | `+10` | `-10` | `+0` |
| `"exceptZero"` | `+10` | `-10` | `0` |
| `"negative"` | `10` | `-10` | `0` |
| `"never"` | `10` | `10` | `0` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    signDisplay: "always"
  }} 
/>
```

---

## 🔢 groupDisplay

**Tipo:** `boolean | "always" | "auto" | "min2"`  
**Padrão:** `"auto"`

Controla o agrupamento de dígitos (separador de milhares).

### 📝 Exemplos:

| groupDisplay | 1234 | 12345 | 123456 |
|--------------|------|-------|--------|
| `true` ou `"always"` | `1.234` | `12.345` | `123.456` |
| `false` | `1234` | `12345` | `123456` |
| `"auto"` | `1.234` | `12.345` | `123.456` |
| `"min2"` | `1234` | `12.345` | `123.456` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    groupDisplay: false
  }} 
/>
```

---

## 🔢 minimumIntegerDigits

**Tipo:** `number`  
**Padrão:** `1`

Define o número mínimo de dígitos inteiros (preenche com zeros à esquerda).

### 📝 Exemplos:

| minimumIntegerDigits | Valor | Saída |
|---------------------|-------|-------|
| `1` | 5 | `5` |
| `2` | 5 | `05` |
| `3` | 5 | `005` |
| `4` | 5 | `0005` |
| `3` | 123 | `123` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    minimumIntegerDigits: 3
  }} 
/>
```

---

## 🔢 maximumIntegerDigits

**Tipo:** `number`

Define o número máximo de dígitos inteiros (trunca à esquerda).

### 📝 Exemplos:

| maximumIntegerDigits | Valor | Saída |
|---------------------|-------|-------|
| `3` | 12345 | `345` |
| `4` | 12345 | `2345` |
| `5` | 12345 | `12345` |
| `2` | 123 | `23` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    maximumIntegerDigits: 3
  }} 
/>
```

---

## 🔢 minimumFractionDigits

**Tipo:** `number`  
**Padrão:** 
- `0` para decimal/percent
- `2` para currency (conforme ISO 4217)

Define o número mínimo de casas decimais (preenche com zeros).

### 📝 Exemplos:

| minimumFractionDigits | Valor | Saída |
|----------------------|-------|-------|
| `0` | 10 | `10` |
| `1` | 10 | `10,0` |
| `2` | 10 | `10,00` |
| `3` | 10.5 | `10,500` |
| `2` | 10.123 | `10,123` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    minimumFractionDigits: 2
  }} 
/>
```

---

## 🔢 maximumFractionDigits

**Tipo:** `number`  
**Padrão:** 
- `max(minimumFractionDigits, 3)` para decimal
- Conforme ISO 4217 para currency (geralmente 2)
- `max(minimumFractionDigits, 0)` para percent

Define o número máximo de casas decimais (arredonda).

### 📝 Exemplos:

| maximumFractionDigits | Valor | Saída |
|----------------------|-------|-------|
| `0` | 10.567 | `11` |
| `1` | 10.567 | `10,6` |
| `2` | 10.567 | `10,57` |
| `3` | 10.567 | `10,567` |
| `2` | 10.1 | `10,1` |

```tsx
<HookDecimalField 
  formatOptions={{ 
    maximumFractionDigits: 2
  }} 
/>
```

---

## 🎨 Exemplos Combinados

### Moeda Americana com Símbolo Estreito
```tsx
<HookCurrencyField 
  formatOptions={{
    locales: "en-US",
    format: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }}
/>
// Input: 1234.567 → Output: $1,234.57
```

### Distância em Quilômetros
```tsx
<HookDecimalField 
  formatOptions={{
    locales: "pt-BR",
    format: "unit",
    unit: "kilometer",
    unitDisplay: "long",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }}
/>
// Input: 42.5 → Output: 42,5 quilômetros
```

### Percentual com Sinal Sempre Visível
```tsx
<HookPercentageField 
  formatOptions={{
    locales: "pt-BR",
    format: "percent",
    signDisplay: "always",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }}
/>
// Input: 0.125 → Output: +12,5%
```

### Número sem Agrupamento
```tsx
<HookDecimalField 
  formatOptions={{
    locales: "pt-BR",
    format: "decimal",
    groupDisplay: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  }}
/>
// Input: 123456.789 → Output: 123456,789
```

### Temperatura em Celsius
```tsx
<HookDecimalField 
  formatOptions={{
    locales: "pt-BR",
    format: "unit",
    unit: "celsius",
    unitDisplay: "short",
    maximumFractionDigits: 1
  }}
/>
// Input: 25.678 → Output: 25,7 °C
```

---

## 📚 Referências

- **@react-input/number-format:** https://www.npmjs.com/package/@react-input/number-format
- **Intl.NumberFormat API:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- **UTS #35 Unit Elements:** https://unicode.org/reports/tr35/tr35-general.html#Unit_Elements
- **ISO 4217 Currency Codes:** https://www.iso.org/iso-4217-currency-codes.html

---

## 💡 Dicas de Uso

1. **Autocomplete TypeScript:** Todos os tipos estão definidos em `types.ts` para autocomplete inteligente
2. **Validação Automática:** O TypeScript valida todos os valores em tempo de desenvolvimento
3. **Fallback Locale:** Se o locale não for suportado, o navegador usará o mais próximo disponível
4. **Performance:** As configurações são memoizadas automaticamente pelos componentes
5. **Unidades Válidas:** Apenas unidades suportadas pelo `Intl.NumberFormat` são aceitas (100+ opções testadas)
6. **Unidades Não Suportadas:** Evite usar `day-person`, `month-person`, `year-person`, `century`, `decade`, `quarter` - causam erro `RangeError: Invalid unit argument`

---

**✨ Desenvolvido para MagicBox - Controle Financeiro Pessoal**
