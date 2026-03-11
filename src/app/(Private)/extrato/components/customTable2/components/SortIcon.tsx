import { Box, Tooltip } from '@mui/material';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';

interface SortIconProps {
  order: 'ASC' | 'DESC' | null;
}

/**
 * Componente para exibir ícone de ordenação
 * Sempre renderiza o Box para manter o espaço, mas com opacidade 0 quando inativo
 */
export function SortIcon({ order }: SortIconProps) {
  const isActive = order !== null;

  return (
    <Tooltip
      title={
        order === 'ASC' ? 'Crescente' : order === 'DESC' ? 'Decrescente' : ''
      }
      arrow
    >
      <Box
        component="span"
        className="sort-icon"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          ml: 1,
          p: 0.3,
          borderRadius: '50%',
          width: 24,
          height: 24,
          minWidth: 0,
          transition: 'all 0.1s linear',
          color: 'primary.main',
          bgcolor: 'primary.light',

          // Estado padrão (inativo e sem hover)
          opacity: 0,

          // Estado ativo (sempre visível)
          ...(isActive && {
            opacity: 1,
            ':hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }),
        }}
      >
        {order === 'DESC' ? (
          <IconArrowDown size={19} strokeWidth={2.5} />
        ) : (
          <IconArrowUp size={19} strokeWidth={2.5} />
        )}
      </Box>
    </Tooltip>
  );
}
