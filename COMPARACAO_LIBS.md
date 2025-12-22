# 🔍 Comparação: @react-input/number-format vs @react-input/mask

## Visão Geral

Criamos componentes de valores numéricos usando **ambas as bibliotecas** para você poder comparar e escolher a melhor opção para cada caso.

## 📦 Componentes Criados

### Usando @react-input/number-format
Localização: `masks/number-format/`
- `HookCurrencyField` - Moeda (R$ 1.234,56)
- `HookPercentageField` - Percentual (12,5%)
- `HookDecimalField` - Decimal (1.234,56)

### Usando @react-input/mask
Localização: `masks/input-mask/`
- `HookCurrencyMaskField` - Moeda (R$ 1.234,56)
- `HookPercentageMaskField` - Percentual (12,5%)
- `HookDecimalMaskField` - Decimal (1.234,56)

## 🎯 Diferenças Principais

### @react-input/number-format

**Características:**
- ✅ Usa `Intl.NumberFormat` (API nativa do navegador)
- ✅ Formatação automática baseada no locale
- ✅ Suporte nativo para moedas, percentuais e decimais
- ✅ Acesso direto ao `valueAsNumber`
- ✅ Menos código customizado
- ✅ Formatação mais precisa e consistente

**Quando usar:**
- Valores monetários padrão
- Percentuais
- Números decimais
- Quando precisar de suporte a múltiplos locales
- Quando a formatação precisa ser consistente com padrões internacionais

**Exemplo:**
```tsx
<HookCurrencyField
  name="valor"
  control={control}
  locale="pt-BR"
  currency="BRL"
/>
```

### @react-input/mask

**Características:**
- ✅ Controle total sobre a formatação
- ✅ Máscaras altamente customizáveis
- ✅ Funciona com qualquer tipo de dado
- ✅ Validações customizadas fáceis
- ✅ Não depende de APIs do navegador
- ⚠️ Requer implementação manual da lógica de formatação

**Quando usar:**
- Máscaras de texto (CPF, CNPJ, CEP, telefone)
- Formatos muito específicos não suportados nativamente
- Quando precisa de controle total sobre a formatação
- Validações customizadas complexas

**Exemplo:**
```tsx
<HookCurrencyMaskField
  name="valor"
  control={control}
  prefix="R$ "
  thousandSeparator="."
  decimalSeparator=","
/>
```

## 📊 Tabela Comparativa

| Aspecto | @react-input/number-format | @react-input/mask |
|---------|---------------------------|-------------------|
| **Formatação** | Intl.NumberFormat (nativa) | Customizada com regex |
| **Locale** | Suporte automático | Configuração manual |
| **Precisão** | Alta (API nativa) | Depende da implementação |
| **Flexibilidade** | Formatos predefinidos | Totalmente customizável |
| **Performance** | Otimizada (nativa) | Boa (JS puro) |
| **Curva de Aprendizado** | Baixa | Média (requer lógica custom) |
| **Manutenção** | Menor | Maior |
| **Casos de Uso** | Valores numéricos padrão | Máscaras complexas/custom |

## 🧪 Testando a Comparação

Criamos uma página interativa para você testar lado a lado:

```
http://localhost:3000/teste/comparacao-libs
```

### O que a página mostra:

1. **Lado Esquerdo**: Componentes usando `@react-input/number-format`
2. **Lado Direito**: Componentes usando `@react-input/mask`
3. **Valores em tempo real**: Veja os valores formatados enquanto digita
4. **Console log**: Compare os valores retornados
5. **Tabela comparativa**: Entenda as diferenças
6. **Recomendações**: Orientações de quando usar cada lib

## 💡 Recomendações Finais

### Use @react-input/number-format para:
- ✅ Valores monetários (R$, US$, €, etc.)
- ✅ Percentuais (%, ‰)
- ✅ Números decimais com separadores
- ✅ Qualquer formatação numérica padrão
- ✅ Quando precisar de suporte a internacionalização

### Use @react-input/mask para:
- ✅ CPF (000.000.000-00)
- ✅ CNPJ (00.000.000/0000-00)
- ✅ CEP (00000-000)
- ✅ Telefone ((00) 00000-0000)
- ✅ Data (DD/MM/AAAA)
- ✅ Hora (HH:MM)
- ✅ Cartão de crédito (0000 0000 0000 0000)
- ✅ Qualquer máscara de texto customizada

## 📈 Exemplos de Código

### Valor Monetário

**Number Format (Recomendado para valores):**
```tsx
import { HookCurrencyField } from "@/app/components/forms/hooksForm";

<HookCurrencyField
  name="valor"
  control={control}
  label="Valor"
  locale="pt-BR"
  currency="BRL"
  returnAsNumber={true}  // Retorna 1234.56
/>
```

**Input Mask (Para casos específicos):**
```tsx
import { HookCurrencyMaskField } from "@/app/components/forms/hooksForm";

<HookCurrencyMaskField
  name="valor"
  control={control}
  label="Valor"
  prefix="R$ "
  thousandSeparator="."
  decimalSeparator=","
  decimalScale={2}
/>
```

### CPF (Use Input Mask)

```tsx
import { HookCPFField } from "@/app/components/forms/hooksForm";

<HookCPFField
  name="cpf"
  control={control}
  label="CPF"
/>
// Máscara: 000.000.000-00
```

## 🎯 Decisão Rápida

```
Preciso formatar...

├─ Valor monetário? 
│  └─ Use: HookCurrencyField (number-format)
│
├─ Percentual?
│  └─ Use: HookPercentageField (number-format)
│
├─ Número decimal?
│  └─ Use: HookDecimalField (number-format)
│
├─ CPF/CNPJ?
│  └─ Use: HookCPFField / HookCNPJField (mask)
│
├─ Telefone?
│  └─ Use: HookPhoneField (mask)
│
├─ CEP?
│  └─ Use: HookCEPField (mask)
│
├─ Data/Hora?
│  └─ Use: HookDateField / HookTimeField (mask)
│
└─ Formato muito específico?
   └─ Use: input-mask com lógica customizada
```

## 📝 Resumo

**@react-input/number-format** é superior para formatação de valores numéricos devido ao uso de APIs nativas, suporte a internacionalização e menor necessidade de código customizado.

**@react-input/mask** é ideal para máscaras de texto e formatos muito específicos onde você precisa de controle total sobre a formatação.

No projeto MagicBox, **use ambas**:
- **number-format** para campos financeiros (valores, taxas, quantidades)
- **mask** para campos de documentos e identificação (CPF, CNPJ, CEP, telefone)

---

**Data:** 22 de dezembro de 2025  
**Status:** ✅ Ambas bibliotecas implementadas e testadas
