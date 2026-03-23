import { IconButton, Stack, Tooltip } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { IActionConfig } from '../types/actions';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IconEye } from '@tabler/icons-react';

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
    // <Visibility fontSize="small" key="default-1" />,
    <IconEye size={18} key="default-15" />,
    <IconEdit size={18} key="default-13" />,
    <IconTrash size={18} key="default-14" />,
    // <Edit fontSize="small" key="default-2" />,
    // <Delete fontSize="small" key="default-3" />,
  ];

  return (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.title} placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => action.callback(row)}
            color={action.color || 'primary'}
          >
            {action.icon || defaultIcons[index]}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
}
