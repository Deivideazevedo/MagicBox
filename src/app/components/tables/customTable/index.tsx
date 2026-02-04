'use client';

import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

// Hooks e componentes internos
import { SortIcon } from './components/SortIcon';
import { TableTopBar } from './components/TableTopBar';
import { useSimpleSort } from './hooks/useSimpleSort';
import { useTableFilter } from './hooks/useTableFilter';
// import { ActionsListMode } from './components/ActionsListMode';
import { createRenderColumn } from './utils/renderColumn';

// Types
import { ActionsListMode } from './components/ActionsListMode';
import { CustomPaginationActions } from './components/CustomPaginationActions';
import { IActionConfig } from './types/actions';
import { ITableColumns } from './types/columnProps';
import { Cliente } from './utils/mockData';

type OrigemType = Cliente;

interface CustomTableProps {
  /** Dados a serem exibidos */
  data: OrigemType[];

  /** Configuração das colunas */
  columns: ITableColumns<OrigemType>;

  /** Lista de ações para cada linha */
  actions: IActionConfig<OrigemType>[];

  /** Paginação */
  pagination: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };

  /** Estado de loading */
  isLoading?: boolean;

  /** Mensagem customizada quando não houver dados */
  emptyMessage?: string;
}

/**
 * 📋 CustomTable - Componente template para tabelas customizáveis
 *
 * Este componente é um TEMPLATE para ser copiado e adaptado conforme necessário.
 * Ele encapsula: filtro, ordenação, paginação e layout básico.
 */
export function CustomTable({
  data,
  columns,
  actions,
  pagination,
  isLoading = false,
  emptyMessage = 'Nenhum dado foi encontrado',
}: CustomTableProps) {
  // 🔍 Hook de filtro (interno)
  const { filteredData, filterText, setFilterText } = useTableFilter({
    data,
    columns,
  });

  // 🎯 Hook de ordenação (interno)
  const { sortedData, requestSort, getSortIcon, setSortConfig } = useSimpleSort(
    filteredData,
    columns,
  );

  // 🔄 Reset de filtros, ordenação Paginação
  const handleReset = () => {
    setFilterText('');
    setSortConfig(null);
    pagination.onRowsPerPageChange({
      target: { value: String(5) },
    } as React.ChangeEvent<HTMLInputElement>);
    pagination.onPageChange(null, 0);
  };

  // 📊 Paginação local
  const paginatedData = sortedData.slice(
    pagination.page * pagination.rowsPerPage,
    pagination.page * pagination.rowsPerPage + pagination.rowsPerPage,
  );

  // 📏 Calcular total de colunas para colSpan
  // 7 colunas: expansão + nome + email + cidade + produtos + total + ações
  const totalColumns = 7;

  return (
    <Paper sx={{ boxShadow: 4 }} variant="outlined">
      {/* TopBar com busca e reset */}
      <TableTopBar
        filterText={filterText}
        onFilterChange={setFilterText}
        onReset={handleReset}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* Coluna de expansão */}
              <TableCell sx={{ width: 0 }} />

              {/* Nome */}
              <TableCell
                onClick={() => requestSort('nome')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('nome') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Nome</Typography>
                  <SortIcon order={getSortIcon('nome')} />
                </Box>
              </TableCell>

              {/* Email */}
              <TableCell
                onClick={() => requestSort('email')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('email') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Email</Typography>
                  <SortIcon order={getSortIcon('email')} />
                </Box>
              </TableCell>

              {/* Cidade */}
              <TableCell
                onClick={() => requestSort('cidade')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('cidade') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Cidade</Typography>
                  <SortIcon order={getSortIcon('cidade')} />
                </Box>
              </TableCell>

              {/* Produtos */}
              <TableCell
                align="right"
                onClick={() => requestSort('produtos')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('produtos') ? 1 : 0.4,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography fontWeight={700}>Produtos</Typography>
                  <SortIcon order={getSortIcon('produtos')} />
                </Box>
              </TableCell>

              {/* Total */}
              <TableCell align="right">
                <Typography fontWeight={700}>Total</Typography>
              </TableCell>

              {/* Ações */}
              <TableCell align="center">
                <Typography fontWeight={700}>Ações</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Loading bar */}
          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={totalColumns} sx={{ p: 0, border: 0 }}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          )}

          <TableBody>
            {paginatedData.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center">
                  <Alert
                    severity="warning"
                    sx={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    {emptyMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <CustomRow
                  key={index}
                  row={row}
                  columns={columns}
                  actions={actions}
                  totalColumns={totalColumns}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-select': {
            borderRadius: '6px',
          },
        }}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        count={pagination.count}
        rowsPerPageOptions={[2, 5, 10, 25, 50]}
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
        ActionsComponent={CustomPaginationActions}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
      />
      {/* <CustomTablePagination pagination={pagination} /> */}
    </Paper>
  );
}

// Componente interno de linha
interface CustomRowProps {
  row: OrigemType;
  columns: ITableColumns<OrigemType>;
  actions: IActionConfig<OrigemType>[];
  totalColumns: number;
}

function CustomRow({ row, columns, actions, totalColumns }: CustomRowProps) {
  const [open, setOpen] = useState(false);

  const totalProdutos = row.produtos.reduce(
    (acc, p) => acc + p.preco * p.quantidade,
    0,
  );

  // Helper para renderizar colunas usando a função utilitária
  const renderColumn = useMemo(
    () => createRenderColumn(row, columns),
    [row, columns],
  );

  return (
    <>
      <TableRow sx={{ '& td': { border: 0 } }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              ':hover': {
                bgcolor: 'primary.light',
                color: 'primary.main',
              },
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        {/* ✨ Renderização flexível - usa render customizado ou valor direto */}
        <TableCell>{renderColumn('nome')}</TableCell>
        <TableCell>{renderColumn('email')}</TableCell>
        <TableCell>{renderColumn('cidade')}</TableCell>
        <TableCell align="right">{renderColumn('produtos')}</TableCell>
        <TableCell align="right">
          R${' '}
          {totalProdutos.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}
        </TableCell>

        {/* Célula de ações - usando modo icon */}
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 0 }}>
          {/* <ActionsIconMode row={row} actions={actions} /> */}
          {/* Para usar modo menu dropdown, substitua por: */}
          <ActionsListMode row={row} actions={actions} />
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, borderTop: 1 }}
          colSpan={totalColumns}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box
                mb={1}
                bgcolor={'grey.100'}
                p={1}
                borderRadius={'4px 4px 0px 0px'}
              >
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Produtos de {row.nome}
                </Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Produto</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Preço Unit.</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Qtd</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>{produto.id}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell align="right">
                        R${' '}
                        {produto.preco.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">{produto.quantidade}</TableCell>
                      <TableCell align="right">
                        R${' '}
                        {(produto.preco * produto.quantidade).toLocaleString(
                          'pt-BR',
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
