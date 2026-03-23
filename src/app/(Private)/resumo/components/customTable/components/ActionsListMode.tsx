import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { IconDotsVertical } from '@tabler/icons-react';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { IActionConfig } from '../types/actions';

interface ActionsListModeProps<T> {
  row: T;
  actions: IActionConfig<T>[];
}

/**
 * Componente para exibir ações em menu dropdown
 * Exibe ícone de três pontos que abre um menu com as ações
 */
export function ActionsListMode<T>({ row, actions }: ActionsListModeProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (callback: (row: T) => void) => {
    callback(row);
    handleClose();
  };

  // Ícones padrão (fallback) para as 3 primeiras ações
  const defaultIcons = [
    <Visibility fontSize="small" key="default-1" />,
    <Edit fontSize="small" key="default-2" />,
    <Delete fontSize="small" key="default-3" />,
  ];

  return (
    <>
      <Tooltip title="Ações" arrow>
        <IconButton
          size="small"
          onClick={handleOpen}
          aria-haspopup="true"
          aria-expanded={isOpen ? 'true' : undefined}
        >
          <IconDotsVertical size="1.1rem" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {actions?.map((action, index) => (
          <MenuItem key={index} onClick={() => handleAction(action.callback)}>
            <ListItemIcon>{action.icon || defaultIcons[index]}</ListItemIcon>
            <ListItemText>{action.title}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
