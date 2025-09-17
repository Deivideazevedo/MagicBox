/**
 * Example component showing modern MUI DataGrid usage
 * This demonstrates fixes for deprecated props and proper configuration
 */

"use client";

import { useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

interface Row {
  id: number;
  name: string;
  age: number;
  email: string;
}

const sampleData: Row[] = [
  { id: 1, name: "João Silva", age: 25, email: "joao@example.com" },
  { id: 2, name: "Maria Santos", age: 30, email: "maria@example.com" },
  { id: 3, name: "Pedro Costa", age: 28, email: "pedro@example.com" },
];

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Nome", width: 200 },
  { field: "age", headerName: "Idade", type: "number", width: 100 },
  { field: "email", headerName: "Email", width: 250 },
];

export default function ModernDataGridExample() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        DataGrid Moderno (MUI v6+)
      </Typography>
      
      <Box sx={{ height: 400, width: "100%" }}>
        {/* CORRECT: Modern approach */}
        <DataGrid
          rows={sampleData}
          columns={columns}
          checkboxSelection
          disableSelectionOnClick
          onRowSelectionModelChange={setSelectedRows}
          rowSelectionModel={selectedRows}
          
          // Modern pagination configuration
          initialState={{
            pagination: {
              paginationModel: { 
                pageSize: 25, 
                page: 0 
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          
          // Modern slots configuration
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Box>
      
      {/* 
      DEPRECATED: Old approach (don't use this)
      <DataGrid
        rows={sampleData}
        columns={columns}
        checkboxSelection
        disableSelectionOnClick
        onSelectionModelChange={setSelectedRows}
        selectionModel={selectedRows}
        
        // Deprecated pagination props
        pageSize={25}
        rowsPerPageOptions={[10, 25, 50, 100]}
        
        // Deprecated components props
        components={{
          Toolbar: GridToolbar,
        }}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
      />
      */}
    </Box>
  );
}