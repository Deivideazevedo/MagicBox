# IconColorMenuPicker

O componente `IconColorMenuPicker` é um seletor visual que combina a escolha de um ícone e uma cor em um único menu suspenso (Popover). Ele foi projetado para ser utilizado com o `react-hook-form`.

## Funcionalidades

- **Preview Visual**: Exibe um botão circular com o ícone e a cor selecionados no momento.
- **Seleção de Ícone**: Integra o `HookIconPicker` para permitir a escolha de ícones.
- **Seleção de Cor**: Integra o `HookColorPicker` para permitir a escolha de cores.
- **Integração com Formulários**: Utiliza o objeto `control` do `react-hook-form` para gerenciar o estado dos campos.

## Props

O componente aceita as seguintes propriedades:

| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `control` | `Control<TFieldValues>` | Sim | O objeto control retornado pelo `useForm`. |
| `iconName` | `Path<TFieldValues>` | Sim | O nome do campo no formulário que armazenará o nome do ícone. |
| `colorName` | `Path<TFieldValues>` | Sim | O nome do campo no formulário que armazenará o valor da cor. |
| `label` | `string` | Não | Texto descritivo exibido acima do componente. |
| `watchIcon` | `string \| null` | Não | O valor atual do ícone (geralmente obtido via `watch` do react-hook-form) para o preview. |
| `watchColor` | `string \| null` | Não | O valor atual da cor (geralmente obtido via `watch` do react-hook-form) para o preview. |

## Exemplo de Uso

```tsx
import { useForm, useWatch } from "react-hook-form";
import { IconColorMenuPicker } from "@/components/forms/hooksForm/IconColorMenuPicker";

function MyForm() {
  const { control } = useForm({
    defaultValues: {
      meuIcone: "IconCategory",
      minhaCor: "#212121"
    }
  });

  const watchIcon = useWatch({ control, name: "meuIcone" });
  const watchColor = useWatch({ control, name: "minhaCor" });

  return (
    <IconColorMenuPicker
      control={control}
      iconName="meuIcone"
      colorName="minhaCor"
      label="Categoria"
      watchIcon={watchIcon}
      watchColor={watchColor}
    />
  );
}
```

## Dependências

- `@mui/material`: Popover, IconButton, Box, Typography, Divider.
- `react-hook-form`: Gerenciamento de estado do formulário.
- `DynamicIcon`: Componente para renderizar ícones dinamicamente.
- `HookIconPicker` e `HookColorPicker`: Componentes internos de seleção.
