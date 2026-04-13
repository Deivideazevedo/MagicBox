'use client';

import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
} from '@mui/icons-material';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

interface CustomPaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
}

export function CustomPaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: CustomPaginationActionsProps) {
  const maxPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const [inputValue, setInputValue] = useState<string>(String(page + 1));

  // Sincroniza o input com a prop page (quando mudada pelos botões)
  useEffect(() => {
    setInputValue(String(page + 1));
  }, [page]);

  const updatePage = (value: string) => {
    const num = parseInt(value, 10) - 1;
    if (!isNaN(num) && num >= 0 && num <= maxPage) {
      onPageChange(null, num);
    } else if (num >= maxPage) {
      onPageChange(null, maxPage); // limita ao máximo
      setInputValue(String(maxPage + 1)); // Atualiza o input
    } else {
      setInputValue(String(page + 1)); // Reset se inválido
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2.5 }}>
      <Tooltip title={page === 0 ? '' : 'Primeira página'} arrow>
        <span>
          <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
            <FirstPage />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={page === 0 ? '' : 'Página anterior'} arrow>
        <span>
          <IconButton
            onClick={(e) => onPageChange(e, page - 1)}
            disabled={page === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={`Página ${page + 1} de ${maxPage + 1}`} arrow>
        <TextField
          size="small"
          value={inputValue}
          autoComplete="off"
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && updatePage(inputValue)}
          onBlur={() => setInputValue(String(page + 1))}
          disabled={page === 0 && maxPage === 0}
          sx={{ mx: 1, '& .MuiOutlinedInput-root': { height: '32px' } }}
          inputProps={{
            style: { textAlign: 'center', width: '40px', padding: '4px' },
            'aria-label': 'Número da página',
          }}
        />
      </Tooltip>

      <Tooltip title={page >= maxPage ? '' : 'Próxima página'} arrow>
        <span>
          <IconButton
            onClick={(e) => onPageChange(e, page + 1)}
            disabled={page >= maxPage}
          >
            <KeyboardArrowRight />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={page >= maxPage ? '' : 'Última página'} arrow>
        <span>
          <IconButton
            onClick={(e) => onPageChange(e, maxPage)}
            disabled={page >= maxPage}
          >
            <LastPage />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
