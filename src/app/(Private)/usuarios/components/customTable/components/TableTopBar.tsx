import { Box, Collapse, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import {
  Search,
  Refresh,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { SearchTextField } from './SearchTextField';
import { ReactNode, useState } from 'react';
import { useIconSpin } from '../hooks/useIconSpin';

interface TableTopBarProps {
  // Filtro
  filterText: string;
  onFilterChange: (text: string) => void;
  onReset: () => void;

  // Customização
  leftActions?: ReactNode;
  bulkActions?: ReactNode;
}

/**
 * Componente TopBar da tabela com busca e ações
 * Inclui botões de reset, busca e área customizável para ações adicionais
 */
export function TableTopBar({
  filterText,
  onFilterChange,
  onReset,
  leftActions,
  bulkActions,
}: TableTopBarProps) {
  const [topBarOpen, setTopBarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Hook para controlar animação de rotação do ícone de reset
  const resetSpin = useIconSpin(1000);

  const handleFocusInput = () => {
    setSearchOpen(true);
  };

  const handleClear = () => {
    onFilterChange('');
    setSearchOpen(false);
  };

  const handleReset = () => {
    resetSpin.trigger(); // Inicia animação de rotação
    setSearchOpen(false);
    onReset();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        pt: 0,
      }}
    >
      {/* ESQUERDA */}
      <Stack direction="row" spacing={1} alignItems="center" pt={1.2}>
        <Tooltip title={topBarOpen ? 'Fechar menu' : 'Abrir menu'} arrow>
          <IconButton
            onClick={() => setTopBarOpen(!topBarOpen)}
            size="small"
            color="primary"
          >
            {topBarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Tooltip>

        <Collapse orientation="horizontal" in={topBarOpen}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Resetar" placement="top" arrow>
              <IconButton
                onClick={handleReset}
                size="small"
                color="primary"
                sx={{
                  transition: resetSpin.isSpinning
                    ? 'transform 1s ease'
                    : 'none',
                  transform: resetSpin.isSpinning ? 'rotate(360deg)' : 'none',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Área para ações customizadas */}
            {leftActions}

            {/* Ações em lote (lixeira, etc) */}
            {bulkActions}
          </Stack>
        </Collapse>
      </Stack>

      {/* DIREITA */}
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        position="relative"
        overflow="hidden"
        pt={1.2}
      >
        <Tooltip title={!searchOpen ? 'Procurar' : ''} arrow>
          <IconButton
            onClick={handleFocusInput}
            size="small"
            color="primary"
            sx={{
              display: !searchOpen ? 'flex' : 'none',
              pointerEvents: !searchOpen ? 'auto' : 'none',
              opacity: !searchOpen ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <Search />
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            position: 'relative',
            maxWidth: searchOpen ? 300 : 0,
            width: '100%',
            opacity: searchOpen ? 1 : 0,
            transition: 'max-width 0.4s ease, opacity 0.4s ease',
          }}
        >
          <SearchTextField
            open={searchOpen}
            value={filterText}
            onChange={onFilterChange}
            onClear={handleClear}
          />
        </Box>
      </Stack>
    </Box>
  );
}
