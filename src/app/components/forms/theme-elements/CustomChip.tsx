import React from 'react';
import { Chip, ChipProps, Theme } from '@mui/material';
import { SxProps } from '@mui/system';

// Define as chaves de cores do tema que queremos suportar
export type StatusColor =
  | 'success'
  | 'warning'
  | 'primary'
  | 'error'
  | 'secondary'
  | 'info';

// Define as props do nosso componente customizado
export interface CustomChipProps extends ChipProps {
  color?: StatusColor;
  sx?: SxProps<Theme>;
}

// Mapeamento das chaves de cores para seus respectivos estilos
const colorConfig: Record<StatusColor, SxProps<Theme>> = {
  success: {
    bgcolor: (theme) => theme.palette.success.light,
    color: (theme) => theme.palette.success.main,
  },
  warning: {
    bgcolor: (theme) => theme.palette.warning.light,
    color: (theme) => theme.palette.warning.main,
  },
  primary: {
    bgcolor: (theme) => theme.palette.primary.light,
    color: (theme) => theme.palette.primary.main,
  },
  error: {
    bgcolor: (theme) => theme.palette.error.light,
    color: (theme) => theme.palette.error.main,
  },
  secondary: {
    bgcolor: (theme) => theme.palette.secondary.light,
    color: (theme) => theme.palette.secondary.main,
  },
  info: {
    bgcolor: (theme) => theme.palette.info.light,
    color: (theme) => theme.palette.info.main,
  },
};

// 1. O componente é envolvido pelo React.forwardRef
const CustomChip = React.forwardRef<HTMLDivElement, CustomChipProps>(
  (
    {
      color = 'primary', // Define 'primary' como cor padrão
      label,
      sx,
      ...rest
    },
    ref, // A 'ref' é recebida como segundo argumento
  ) => {
    const styles = colorConfig[color];

    return (
      <Chip
        label={label}
        size="small"
        sx={[
          {
            borderRadius: '16px',
            fontWeight: 600,
          },
          styles,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest} // Passa todas as outras props
        ref={ref} // 2. A 'ref' é passada para o Chip do MUI
      />
    );
  },
);

CustomChip.displayName = 'CustomChip';

export default CustomChip;
