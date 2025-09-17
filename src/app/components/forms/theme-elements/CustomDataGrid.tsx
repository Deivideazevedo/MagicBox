"use client";

import {
  DataGrid as MuiDataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface CustomDataGridProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  checkboxSelection?: boolean;
  disableSelectionOnClick?: boolean;
  onSelectionModelChange?: (selectionModel: any[]) => void;
  selectionModel?: any[];
  pageSize?: number;
  [key: string]: any;
}

export default function CustomDataGrid({
  rows,
  columns,
  loading = false,
  checkboxSelection = false,
  disableSelectionOnClick = false,
  onSelectionModelChange,
  selectionModel = [],
  pageSize = 25,
  ...props
}: CustomDataGridProps) {
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    // Handle pagination changes here if needed
  };

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <MuiDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableSelectionOnClick}
        onRowSelectionModelChange={onSelectionModelChange}
        rowSelectionModel={selectionModel}
        onPaginationModelChange={handlePaginationModelChange}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize,
              page: 0,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "action.hover",
          },
        }}
        {...props}
      />
    </Box>
  );
}