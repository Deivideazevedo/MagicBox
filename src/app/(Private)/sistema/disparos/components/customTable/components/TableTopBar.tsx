import { alpha, Badge, Box, Collapse, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import {
  Search,
  Refresh,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { IconChevronLeft, IconChevronRight, IconReload, IconTrash } from '@tabler/icons-react';
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

  // Seleção e Deleção
  selectedCount?: number;
  onBulkDelete?: () => void;
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
  selectedCount = 0,
  onBulkDelete,
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
            {topBarOpen ? <IconChevronLeft size={20} stroke={2.5} /> : <IconChevronRight size={20} stroke={2.5} />}
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
                <IconReload size={20} stroke={2.5} />
              </IconButton>
            </Tooltip>

            {/* Área para ações customizadas */}
            {leftActions}

            {/* Botão de Excluir em Lote com Badge */}
            {selectedCount > 0 && (
              <Tooltip title="Excluir selecionados" arrow>
                <IconButton
                  onClick={onBulkDelete}
                  size="small"
                  sx={{
                    color: 'error.main',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                    '&:hover': {
                      color: 'error.dark',
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.4),
                    },
                    ml: 1
                  }}
                >
                  <Badge
                    badgeContent={selectedCount}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        height: '16px',
                        minWidth: '16px',
                        padding: '0 4px',// Ajuste aqui para mover para o topo e para a direita
                        top: -2,
                        right: -2,
                      }
                    }}
                  >
                    <IconTrash size={20} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
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
