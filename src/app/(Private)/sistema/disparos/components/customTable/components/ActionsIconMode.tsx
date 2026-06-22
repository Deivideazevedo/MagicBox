import { IconButton, Stack, Tooltip } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { IActionConfig } from "@/app/components/tables/customTable/types/actions";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";

interface ActionsIconModeProps<T> {
  row: T;
  actions: IActionConfig<T>[];
}

/**
 * Componente para exibir ações como ícones diretos
 * Renderiza botões de ação individuais lado a lado
 */
export function ActionsIconMode<T>({ row, actions }: ActionsIconModeProps<T>) {
  // Ícones padrão (fallback) para as 3 primeiras ações
  const defaultIcons = [
    <IconEye size={18} key="default-1" />,
    <IconEdit size={18} key="default-2" />,
    <IconTrash size={18} key="default-3" />,
  ];

  return (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.title} placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => action.callback(row)}
            color={action.color || "primary"}
          >
            {action.icon || defaultIcons[index]}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
}
