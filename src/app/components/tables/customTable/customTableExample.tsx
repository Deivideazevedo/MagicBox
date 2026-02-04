'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

// CustomTable
import { CustomTable } from '.';
import { ITableColumns } from './types/columnProps';
import { IActionConfig } from './types/actions';

// Mock data
import { clientes, Cliente } from './utils/mockData';

/**
 * 📊 Exemplo de uso da CustomTable
 */
export default function TestPage() {
  // Estado de paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estados para simulação
  const [isLoading, setIsLoading] = useState(false);
  const [showEmptyData, setShowEmptyData] = useState(false);

  // 📋 Configuração das colunas
  const columns: ITableColumns<Cliente> = {
    produtos: {
      sortValue: (row) => row.produtos.length,
      render: (row) => row.produtos.length,
    },
  };

  // 🎬 Configuração das ações de linha
  const actions: IActionConfig<Cliente>[] = [
    {
      title: 'Ver detalhes',
      callback: (row) => console.warn('Visualizar:', row),
      color: 'primary',
    },
    {
      title: 'Editar cliente',
      callback: (row) => console.warn('Editar:', row),
      color: 'primary',
    },
    {
      title: 'Remover cliente',
      callback: (row) => console.warn('Deletar:', row),
      color: 'error',
    },
  ];

  // Handlers de paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 🎭 Simuladores de estados
  const handleSimulateLoading = () => {
    setIsLoading(true);
    // setShowEmptyData(false);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleToggleEmptyData = () => {
    setShowEmptyData(!showEmptyData);
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsLoading(false);
    setShowEmptyData(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📊 Collapsible Table - Clientes e Produtos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Clique na seta para expandir os produtos • Clique no cabeçalho para
        ordenar
      </Typography>

      {/* Controles de Simulação */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSimulateLoading}
          disabled={isLoading}
        >
          Simular Loading (3s)
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleToggleEmptyData}
        >
          {showEmptyData ? 'Mostrar Dados' : 'Simular Sem Dados'}
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Resetar
        </Button>
      </Stack>

      <CustomTable
        data={showEmptyData ? [] : clientes}
        columns={columns}
        actions={actions}
        pagination={{
          page,
          rowsPerPage,
          count: showEmptyData ? 0 : clientes.length,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
        isLoading={isLoading}
        emptyMessage="Nenhum cliente foi encontrado"
      />
    </Box>
  );
}
