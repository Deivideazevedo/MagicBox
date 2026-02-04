'use client';

import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardDoubleArrowRight,
  NavigateNext,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface CustomPaginationProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export function CustomTablePagination({ pagination }: CustomPaginationProps) {
  const { page, rowsPerPage, count, onPageChange, onRowsPerPageChange } =
    pagination;

  const maxPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const [inputValue, setInputValue] = useState<string>(String(page + 1));

  useEffect(() => {
    setInputValue(String(page + 1));
  }, [page]);

  const handlePageSubmit = () => {
    const num = parseInt(inputValue, 10) - 1;
    if (!isNaN(num) && num >= 0 && num <= maxPage) {
      onPageChange(null, num);
    } else {
      setInputValue(String(page + 1));
    }
  };

  const handleRowsChange = (e: SelectChangeEvent<number>) => {
    // Simula o evento de ChangeEvent<HTMLInputElement> esperado pela sua tipagem
    onRowsPerPageChange({
      target: { value: String(e.target.value) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        p: 1,
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Página{' '}
        <strong>
          {page + 1} de {maxPage + 1}
        </strong>
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mx: 1 }}
      >
        |
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
      >
        Ir para a página:
      </Typography>

      <TextField
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
        onBlur={handlePageSubmit}
        onKeyDown={(e) => e.key === 'Enter' && handlePageSubmit()}
        sx={{
          width: '50px',
          mx: 1,
          '& .MuiOutlinedInput-root': { height: '35px', borderRadius: '8px' },
        }}
      />

      <Select
        size="small"
        value={rowsPerPage}
        onChange={handleRowsChange}
        sx={{ height: '35px', borderRadius: '8px', minWidth: '50px', ml: 0 }}
      >
        {[2, 5, 10, 25, 50, 100].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>

      <Box sx={{ display: 'flex', ml: 1 }}>
        <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
          <FirstPage />
        </IconButton>
        <IconButton
          onClick={(e) => onPageChange(e, page - 1)}
          disabled={page === 0}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={(e) => onPageChange(e, page + 1)}
          disabled={page >= maxPage}
        >
          <NavigateNext />
        </IconButton>
        <IconButton
          onClick={(e) => onPageChange(e, maxPage)}
          disabled={page >= maxPage}
        >
          <KeyboardDoubleArrowRight />
        </IconButton>
      </Box>
    </Box>
  );
}
