# ✅ Atualização: Retorno Flexível (String ou Number)

## 🎯 O que foi implementado?

Adicionada a propriedade `returnAsNumber` em todos os campos numéricos, permitindo escolher entre retornar o valor como **string formatada** ou **number**.

## 📦 Componentes Atualizados

### 1. HookCurrencyField
```tsx
<HookCurrencyField
  name="valor"
  control={control}
  returnAsNumber={false}  // ⬅️ NOVO: false = string, true = number
/>
```

### 2. HookPercentageField
```tsx
<HookPercentageField
  name="taxa"
  control={control}
  returnAsNumber={false}  // ⬅️ NOVO: false = string, true = number
/>
```

### 3. HookDecimalField
```tsx
<HookDecimalField
  name="quantidade"
  control={control}
  returnAsNumber={false}  // ⬅️ NOVO: false = string, true = number
/>
```

## 📊 Comparação de Retorno

| Prop `returnAsNumber` | Entrada do Usuário | Valor Retornado | Tipo |
|-----------------------|-------------------|-----------------|------|
| `false` (padrão) | R$ 1.234,56 | "R$ 1.234,56" | `string` |
| `true` | R$ 1.234,56 | 1234.56 | `number` |

## 🧪 Página de Teste Criada

Uma página completa de teste foi criada em:

```
src/app/(Private)/teste/mascaras/page.tsx
```

**Acesse:** `http://localhost:3000/teste/mascaras`

A página mostra:
- ✅ Campos retornando STRING (lado esquerdo)
- ✅ Campos retornando NUMBER (lado direito)
- ✅ Máscaras de texto (sempre string)
- ✅ Valores em tempo real
- ✅ Console log com tipos dos dados
- ✅ Comparação visual lado a lado

## 🎨 Screenshot da Página de Teste

A página contém:
```
┌─────────────────────────────────────────────────────────┐
│  🧪 Teste de Máscaras - String vs Number                │
├──────────────────────┬──────────────────────────────────┤
│  📝 STRING           │  🔢 NUMBER                       │
│  ├─ Valor Monetário  │  ├─ Valor Monetário              │
│  ├─ Taxa Percentual  │  ├─ Taxa Percentual              │
│  ├─ Quantidade       │  ├─ Quantidade                   │
│  └─ [Valores em JSON]│  └─ [Valores em JSON]            │
├──────────────────────┴──────────────────────────────────┤
│  🎭 Máscaras de Texto (Sempre String)                   │
│  ├─ CPF              ├─ Telefone        ├─ CEP          │
│  └─ [Valores em JSON]                                   │
├─────────────────────────────────────────────────────────┤
│           [🔍 Ver Resultado no Console]                 │
└─────────────────────────────────────────────────────────┘
```

## 💡 Quando Usar Cada Opção?

### `returnAsNumber={false}` - Retorna STRING
✅ Salvar valor formatado no banco  
✅ Exibir em relatórios sem processamento  
✅ Manter formato visual do usuário  
✅ API espera string formatada  

**Exemplo de retorno:** `"R$ 1.234,56"`

### `returnAsNumber={true}` - Retorna NUMBER
✅ Fazer cálculos matemáticos  
✅ Armazenar em campo numérico do banco  
✅ Comparar valores numericamente  
✅ API espera tipo number  

**Exemplo de retorno:** `1234.56`

## 📝 Exemplo Prático

```tsx
import { useForm } from "react-hook-form";
import { HookCurrencyField } from "@/app/components/forms/hooksForm";

interface FormData {
  valorFormatado: string;  // Para exibição
  valorNumerico: number;   // Para cálculos
}

function MeuFormulario() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    // {
    //   valorFormatado: "R$ 1.234,56",  // string
    //   valorNumerico: 1234.56           // number
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* STRING: Para exibir */}
      <HookCurrencyField
        name="valorFormatado"
        control={control}
        label="Valor para Exibição"
        returnAsNumber={false}  // padrão
      />

      {/* NUMBER: Para calcular */}
      <HookCurrencyField
        name="valorNumerico"
        control={control}
        label="Valor para Cálculos"
        returnAsNumber={true}
      />

      <button type="submit">Enviar</button>
    </form>
  );
}
```

## 🔄 Compatibilidade

- ✅ Totalmente compatível com versão anterior
- ✅ `returnAsNumber={false}` é o padrão (retorna string)
- ✅ Máscaras de texto não foram alteradas (sempre string)
- ✅ TypeScript: tipos atualizados corretamente

## 📚 Documentação

Três arquivos de documentação criados/atualizados:

1. **`README.md`** - Documentação geral das máscaras
2. **`STRING_VS_NUMBER.md`** - Guia detalhado sobre tipos de retorno
3. **`MASKS_INSTALLATION.md`** - Resumo da instalação

## ✅ Checklist

- [x] Propriedade `returnAsNumber` adicionada
- [x] HookCurrencyField atualizado
- [x] HookPercentageField atualizado
- [x] HookDecimalField atualizado
- [x] Página de teste criada
- [x] Documentação atualizada
- [x] Zero erros de compilação
- [x] TypeScript configurado corretamente

## 🚀 Como Testar

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   yarn dev
   ```

2. **Acesse a página de teste:**
   ```
   http://localhost:3000/teste/mascaras
   ```

3. **Preencha os campos e observe:**
   - Valores formatados em tempo real
   - Diferença entre string e number
   - Console log ao clicar em "Ver Resultado"

## 🎉 Resultado

Agora você tem **controle total** sobre o tipo de retorno dos campos numéricos, podendo escolher entre string formatada ou número puro conforme sua necessidade!

---

**Data da Atualização:** 22 de dezembro de 2025  
**Versão:** 2.0 - Retorno Flexível
