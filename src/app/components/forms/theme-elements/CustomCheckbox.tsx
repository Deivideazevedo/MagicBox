import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { Palette } from '@mui/material/styles';
import { styled } from '@mui/system';
import * as React from 'react';

// Tipo para extrair apenas as chaves de cor da paleta do tema.
type PaletteColorKey = keyof Omit<
  Palette,
  | 'mode'
  | 'common'
  | 'grey'
  | 'text'
  | 'divider'
  | 'action'
  | 'background'
  | 'getContrastText'
  | 'augmentColor'
  | 'contrastThreshold'
  | 'tonalOffset'
>;

// Props internas para os ícones estilizados.
interface StyledIconProps {
  ownerState: { color: PaletteColorKey };
  variant?: 'square' | 'round';
  size?: 'small' | 'medium' | 'large';
}

// Ícone base para o estado "não marcado".
const BpIcon = styled('span')<StyledIconProps>(({
  theme,
  ownerState,
  variant,
  size = 'medium',
}) => {
  // Mapeamento para controle de tamanho via prop.
  const sizeMap = {
    small: 16,
    medium: 19,
    large: 22,
  };
  const currentSize = sizeMap[size] || sizeMap.medium;

  return {
    borderRadius: variant === 'round' ? '50%' : 3,
    width: currentSize,
    height: currentSize,
    marginLeft: '4px',
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 1px ${theme.palette.grey[200]}`
        : `inset 0 0 0 1px ${theme.palette.grey[300]}`,
    backgroundColor: 'transparent',
    'input:hover ~ &': {
      boxShadow: `inset 0 0 0 2px ${
        theme.palette[ownerState.color]?.main || theme.palette.primary.main
      }`,
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: theme.palette.grey[100],
    },
  };
});

// Ícone para o estado "marcado".
const BpCheckedIcon = styled(BpIcon)<StyledIconProps>(
  ({ theme, ownerState }) => ({
    backgroundColor:
      theme.palette[ownerState.color]?.main || theme.palette.primary.main,
    boxShadow: 'none',
    '&:before': {
      display: 'block',
      width: '100%', // Adapta-se ao tamanho do BpIcon
      height: '100%', // Adapta-se ao tamanho do BpIcon
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
  }),
);

// Ícone para o estado "indeterminado".
const BpIndeterminateIcon = styled(BpIcon)<StyledIconProps>(
  ({ theme, ownerState }) => ({
    backgroundColor:
      theme.palette[ownerState.color]?.main || theme.palette.primary.main,
    boxShadow: 'none',

    // Prepara o container para o posicionamento absoluto do pseudo-elemento
    position: 'relative',

    // O pseudo-elemento `::before` será a nossa linha horizontal
    '&:before': {
      content: '""',
      display: 'block',

      // --- A MÁGICA DA CENTRALIZAÇÃO PERFEITA ---
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',

      // --- ESTILO DA LINHA ---
      width: '60%', // Largura da linha em porcentagem para se adaptar ao tamanho
      height: 2, // Espessura da linha
      borderRadius: 1, // Bordas levemente arredondadas para a linha
      backgroundColor: '#fff', // Cor da linha (branco)
    },
  }),
);

// Define as props públicas do componente.
export interface CustomCheckboxProps extends Omit<CheckboxProps, 'color'> {
  color?: PaletteColorKey;
  variant?: 'square' | 'round';
}

const CustomCheckbox = React.forwardRef<HTMLButtonElement, CustomCheckboxProps>(
  (
    { color = 'primary', variant = 'square', size = 'medium', ...props },
    ref,
  ) => {
    return (
      <Checkbox
        ref={ref}
        size={size}
        disableRipple
        icon={<BpIcon ownerState={{ color }} variant={variant} size={size} />}
        checkedIcon={
          <BpCheckedIcon ownerState={{ color }} variant={variant} size={size} />
        }
        indeterminateIcon={
          <BpIndeterminateIcon
            ownerState={{ color }}
            variant={variant}
            size={size}
          />
        }
        {...props}
      />
    );
  },
);

CustomCheckbox.displayName = 'CustomCheckbox';

export default CustomCheckbox;
