import { Close, Search } from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  SxProps,
  TextFieldProps,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';

interface SearchTextFieldProps
  extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  open?: boolean;
  onClear?: () => void;
  sx?: SxProps;
  /**
   * When true, focuses the input when `open` becomes true. Default: true (preserves current behavior)
   */
  autoFocusOnOpen?: boolean;
  /**
   * Controls visibility of the search (magnifier) icon at startAdornment. Default: true
   */
  showSearchIcon?: boolean;
  /**
   * Callback fired when Enter key is pressed
   */
  onSubmit?: () => void;
}

export const SearchTextField = React.forwardRef<
  HTMLInputElement,
  SearchTextFieldProps
>(
  (
    {
      open,
      value,
      onChange,
      onClear,
      onSubmit,
      placeholder = 'Procurar...',
      sx,
      autoFocusOnOpen = true,
      showSearchIcon = true,
      ...rest
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(internalRef, ref);

    const handleFocus = () => {
      internalRef.current?.focus();
    };

    useEffect(() => {
      if (!open) return;
      if (!autoFocusOnOpen) return;
      internalRef.current?.focus();
    }, [open, autoFocusOnOpen]);

    const handleClear = () => {
      handleFocus();
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.();
      }
    };

    return (
      <CustomTextField
        size="small"
        variant="outlined"
        placeholder={placeholder}
        value={value}
        inputRef={handleInputRef}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onKeyDown={handleKeyDown}
        sx={{
          width: '100%',
          '& .MuiInputBase-root': {
            paddingX: '10px',
          },
          '& .MuiInputBase-input': {
            paddingLeft: '6px',
          },
          ...sx,
        }}
        InputProps={{
          startAdornment: showSearchIcon ? (
            <InputAdornment position="start" sx={{ mr: 0 }}>
              <Search
                fontSize="small"
                onClick={handleFocus}
                color="primary"
                sx={{ cursor: 'pointer' }}
              />
            </InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position="end" sx={{ p: 0, m: 0 }}>
              <Tooltip title="Limpar" arrow>
                <IconButton
                  size="small"
                  onClick={handleClear}
                  sx={{
                    visibility: value ? 'visible' : 'hidden',
                    width: 20,
                    height: 20,
                    backgroundColor: 'grey.200',
                    '&:hover': {
                      backgroundColor: 'grey.300',
                    },
                  }}
                  aria-label="Limpar"
                >
                  <Close
                    sx={{
                      fontSize: 12,
                      color: 'grey.500',
                      stroke: (theme) => theme.palette.grey[500],
                      strokeWidth: 1,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        {...rest}
      />
    );
  },
);

SearchTextField.displayName = 'SearchTextField';
