import { Box } from '@mui/material';

interface TableFooterProps {
  filteredCount: number;
  totalCount: number;
}

/**
 * Componente Footer da tabela com contagem de registros
 * Exibe: "Total: X / Y" quando filtrado, ou "Total: X" quando não filtrado
 */
export function TableFooter({ filteredCount, totalCount }: TableFooterProps) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: 13,
      }}
    >
      Total:{' '}
      {filteredCount !== totalCount
        ? `${filteredCount} / ${totalCount}`
        : totalCount}
    </Box>
  );
}
