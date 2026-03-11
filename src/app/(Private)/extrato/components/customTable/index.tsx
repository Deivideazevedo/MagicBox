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
import { MultiSortIcon } from './components/MultiSortIcon';
// import { SortIcon } from './components/SortIcon';
import { TableTopBar } from './components/TableTopBar';
import { MultiSortConfig, useMultiSort } from './hooks/useMultiSort';
// import { useSimpleSort } from './hooks/useSimpleSort';
import { useTableFilter } from './hooks/useTableFilter';
// import { ActionsListMode } from './components/ActionsListMode';
import { createRenderColumn } from './utils/renderColumn';

// Types
import { ActionsListMode } from './components/ActionsListMode';
import { CustomPaginationActions } from './components/CustomPaginationActions';
import { IActionConfig } from './types/actions';
import { ITableColumns } from './types/columnProps';
import { Cliente } from './utils/mockData';
import { Lancamento } from "@/core/lancamentos/types";


// NOVO CUSTOMTABLE - TEMPLATE PARA SER COPIADO E ADAPTADO
type OrigemType = Lancamento & { origem: string; nome: string };

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

  /** Ordenação inicial - aplicada ao montar o componente */
  initialSort?: MultiSortConfig<OrigemType>[];

  /** Ordenação externa - sincronizada com o estado do pai */
  externalSort?: MultiSortConfig<OrigemType>[];

  /** Callback quando a ordenação muda - para sincronização externa */
  onExternalSort?: (sort: MultiSortConfig<OrigemType>[]) => void;
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
  initialSort,
  externalSort,
  onExternalSort,
}: CustomTableProps) {
  // 🔍 Hook de filtro (interno)
  const { filteredData, filterText, setFilterText } = useTableFilter({
    data,
    columns,
  });

  // 🎯 Hook de ordenação multi-coluna (interno)
  const { sortedData, requestSort, getSortIcon, resetSort } = useMultiSort(
    filteredData,
    columns,
    externalSort ?? initialSort, // Prioriza externalSort, senão usa initialSort
    onExternalSort,
    initialSort, // Passa initialSort para resetar corretamente
  );

  // 🔄 Reset de filtros, ordenação Paginação
  const handleReset = () => {
    setFilterText('');
    resetSort(); // Para multi-sort
    // setSortConfig(null); // Para simple-sort
    pagination.onRowsPerPageChange({
      target: { value: String(10) },
    } as React.ChangeEvent<HTMLInputElement>);
    pagination.onPageChange(null, 0);
  };

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
                onClick={() => requestSort('data')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('data') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Data</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('data')} />
                </Box>
              </TableCell>

              {/* Email */}
              <TableCell
                onClick={() => requestSort('origem')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('origem') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Origem</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('origem')} />
                </Box>
              </TableCell>

              {/* Tipo */}
              <TableCell
                onClick={() => requestSort('tipo')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('tipo') ? 1 : 0.4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Tipo</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('tipo')} />
                  {/* <SortIcon order={getSortIcon('cidade')} /> */}
                </Box>
              </TableCell>

              {/* Nome */}
              <TableCell
                align="right"
                onClick={() => requestSort('nome')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('nome') ? 1 : 0.4,
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
                  <Typography fontWeight={700}>Nome</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('nome')} />
                </Box>
              </TableCell>



              {/* Nome */}
              <TableCell
                align="right"
                onClick={() => requestSort('observacao')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('observacao') ? 1 : 0.4,
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
                  <Typography fontWeight={700}>Observação</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('observacao')} />
                </Box>
              </TableCell>



              {/* Nome */}
              <TableCell
                align="right"
                onClick={() => requestSort('valor')}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover .sort-icon': {
                    opacity: getSortIcon('valor') ? 1 : 0.4,
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
                  <Typography fontWeight={700}>Valor</Typography>
                  <MultiSortIcon sortInfo={getSortIcon('valor')} />
                </Box>
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
            {sortedData.length === 0 && !isLoading ? (
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
              sortedData.map((row, index) => (
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
        <TableCell>{renderColumn('data')}</TableCell>
        <TableCell>{renderColumn('origem')}</TableCell>
        <TableCell>{renderColumn('tipo')}</TableCell>
        <TableCell align="right">{renderColumn('nome')}</TableCell>
        <TableCell align="right">
          R${' '}
          {row.valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell align="right">{renderColumn('observacao')}</TableCell>

        {/* Célula de ações - usando modo icon */}
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 0 }}>
          {/* <ActionsIconMode row={row} actions={actions} /> */}
          {/* Para usar modo menu dropdown, substitua por: */}
          <ActionsListMode row={row} actions={actions} />
        </TableCell>
      </TableRow>

      {/* <TableRow>
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
      </TableRow> */}
    </>
  );
}
