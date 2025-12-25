# DatePicker - Quick Reference

> **Página de Testes**: `/teste/datepicker` - Veja todos os exemplos funcionando em tempo real!

## ✅ Implementação Nativa (MUI X v8 + React Hook Form)

Os componentes seguem a **abordagem nativa recomendada**:

- **TextField embutido**: Não precisa passar `slots={{ textField: TextField }}` - o DatePicker já usa internamente
- **inputRef automático**: O `field.ref` é passado automaticamente via `inputRef`
- **Validação de data**: Valida `isNaN(date.getTime())` antes de converter para evitar erro "Invalid time value"
- **slotProps simplificado**: Passa `error` e `helperText` diretamente sem type assertions (`as any`)
- **Sem `enableAccessibleFieldDOMStructure={false}`**: Usa comportamento padrão do MUI X v8

**Referência**: [React Hook Form Discussion #10135](https://github.com/orgs/react-hook-form/discussions/10135)

---

## 📦 Importação

```tsx
import { HookDatePicker, HookMonthPicker, HookYearPicker } from "@/app/components/forms/hooksForm";
```

## 📅 Exemplos de Uso

### 1. Data Básica
```tsx
<HookDatePicker name="data" control={control} label="Data" />
```

### 2. Com Validação
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  rules={{ required: "Data obrigatória" }}
/>
```

### 3. Selecionar Hoje
```tsx
const { setValue } = useForm();
setValue("data", new Date().toISOString().split("T")[0]);
```

### 4. Com Botão "Hoje" Integrado
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  slotProps={{ actionBar: { actions: ["today", "clear", "accept"] } }}
/>
```

### 5. Apenas Futuro
```tsx
<HookDatePicker name="data" control={control} label="Data" disablePast />
```

### 6. Apenas Passado
```tsx
<HookDatePicker name="data" control={control} label="Data" disableFuture />
```

### 7. Intervalo Específico
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  minDate={new Date()}
  maxDate={new Date(2025, 11, 31)}
/>
```

### 8. Apenas Dias Úteis
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  shouldDisableDate={(date) => [0, 6].includes(date.getDay())}
/>
```

### 9. Mês/Ano Rápido
```tsx
<HookMonthPicker name="mes" control={control} label="Mês" />
```

### 10. Ano Rápido
```tsx
<HookYearPicker name="ano" control={control} label="Ano" />
```

### 11. Intervalo de Datas
```tsx
const dataInicio = watch("dataInicio");

<HookDatePicker name="dataInicio" control={control} label="Início" />
<HookDatePicker
  name="dataFim"
  control={control}
  label="Fim"
  minDate={dataInicio ? new Date(dataInicio) : undefined}
/>
```

### 12. Retornar Date Object
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  formatAsISOString={false}
/>
```

### 13. Formato Customizado
```tsx
<HookDatePicker
  name="data"
  control={control}
  label="Data"
  format="dd 'de' MMMM 'de' yyyy"
/>
```

### 14. Somente Leitura
```tsx
<HookDatePicker name="data" control={control} label="Data" readOnly />
```

### 15. Desabilitado
```tsx
<HookDatePicker name="data" control={control} label="Data" disabled />
```

## 🎯 Props Principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `name` | `string` | Nome do campo (obrigatório) |
| `control` | `Control` | Control do useForm (obrigatório) |
| `label` | `string` | Label do campo |
| `rules` | `object` | Validações do React Hook Form |
| `disablePast` | `boolean` | Desabilita datas passadas |
| `disableFuture` | `boolean` | Desabilita datas futuras |
| `minDate` / `maxDate` | `Date` | Limites de datas |
| `shouldDisableDate` | `(date: Date) => boolean` | Função de validação customizada |
| `format` | `string` | Formato de exibição (padrão: dd/MM/yyyy) |
| `formatAsISOString` | `boolean` | Retorna string ISO (padrão: true) |

## 🔥 Snippets Úteis

### Preencher com Hoje
```tsx
const hoje = new Date().toISOString().split("T")[0];
setValue("data", hoje);
```

### Preencher com Início do Mês
```tsx
const hoje = new Date();
const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  .toISOString().split("T")[0];
setValue("data", inicioMes);
```

### Preencher com Fim do Mês
```tsx
const hoje = new Date();
const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  .toISOString().split("T")[0];
setValue("data", fimMes);
```

### Validar Data Futura
```tsx
rules={{
  validate: (value) => {
    const date = new Date(value);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return date >= hoje || "Data deve ser futura";
  }
}}
```

### Validar Intervalo de 18-65 anos
```tsx
const hoje = new Date();
const max18 = new Date(hoje.getFullYear() - 18, hoje.getMonth(), hoje.getDate());
const max65 = new Date(hoje.getFullYear() - 65, hoje.getMonth(), hoje.getDate());

<HookDatePicker
  name="dataNascimento"
  control={control}
  label="Data de Nascimento"
  minDate={max65}
  maxDate={max18}
/>
```

---

## 📖 Documentação Completa

- [HookDatePicker.README.md](../src/app/components/forms/hooksForm/HookDatePicker.README.md) - 15 exemplos completos
- [DATEPICKER_SETUP_SUMMARY.md](./DATEPICKER_SETUP_SUMMARY.md) - Resumo da configuração
- [EXEMPLO_HOOKDATEPICKER.md](./EXEMPLO_HOOKDATEPICKER.md) - Exemplo real
## 🌍 Configuração

O `LocalizationProvider` está configurado **globalmente** em `src/app/app.tsx`:

```tsx
<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
  {/* Toda a aplicação */}
</LocalizationProvider>
```

Isso garante:
- ✅ Localização em português brasileiro
- ✅ Formato dd/MM/yyyy
- ✅ Nomes de meses e dias em português

## 🔗 Links

- **Página de Testes**: `/teste/datepicker` - Exemplos interativos
- [MUI X DatePicker Docs](https://mui.com/x/react-date-pickers/date-picker/)
- [React Hook Form Docs](https://react-hook-form.com/)