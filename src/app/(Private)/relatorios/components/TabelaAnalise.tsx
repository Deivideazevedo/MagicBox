"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

interface AnaliseRow {
  id: string;
  categoria: string;
  orcamento: number;
  gasto: number;
  diferenca: number;
  percentual: number;
  tendencia: "up" | "down" | "stable";
  icon: string;
  color: string;
}

export default function TabelaAnalise() {
  const [pageSize, setPageSize] = useState(5);

  // Dados mockados - conectar com API real
  const rows: AnaliseRow[] = [
    {
      id: "1",
      categoria: "Alimentação",
      orcamento: 1200,
      gasto: 1520,
      diferenca: -320,
      percentual: 126.7,
      tendencia: "up",
      icon: "🍽️",
      color: "#FA896B",
    },
    {
      id: "2", 
      categoria: "Transporte",
      orcamento: 800,
      gasto: 890,
      diferenca: -90,
      percentual: 111.3,
      tendencia: "up",
      icon: "🚗",
      color: "#5D87FF",
    },
    {
      id: "3",
      categoria: "Moradia",
      orcamento: 1000,
      gasto: 650,
      diferenca: 350,
      percentual: 65.0,
      tendencia: "down",
      icon: "🏠",
      color: "#13DEB9",
    },
    {
      id: "4",
      categoria: "Saúde", 
      orcamento: 500,
      gasto: 420,
      diferenca: 80,
      percentual: 84.0,
      tendencia: "stable",
      icon: "⚕️",
      color: "#FFAE1F",
    },
    {
      id: "5",
      categoria: "Lazer",
      orcamento: 600,
      gasto: 380,
      diferenca: 220,
      percentual: 63.3,
      tendencia: "down",
      icon: "🎮",
      color: "#539BFF",
    },
    {
      id: "6",
      categoria: "Educação",
      orcamento: 400,
      gasto: 280,
      diferenca: 120,
      percentual: 70.0,
      tendencia: "stable",
      icon: "📚",
      color: "#9C27B0",
    },
  ];

  const columns: GridColDef[] = [
    {
      field: "categoria",
      headerName: "Categoria",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: params.row.color,
              width: 32,
              height: 32,
              fontSize: "14px",
            }}
          >
            {params.row.icon}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "orcamento",
      headerName: "Orçamento",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="textSecondary">
          R$ {params.value.toLocaleString("pt-BR")}
        </Typography>
      ),
    },
    {
      field: "gasto",
      headerName: "Gasto Real",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          R$ {params.value.toLocaleString("pt-BR")}
        </Typography>
      ),
    },
    {
      field: "diferenca",
      headerName: "Diferença",
      width: 120,
      align: "right", 
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value as number;
        const isPositive = value > 0;
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            {isPositive ? (
              <ArrowDownward sx={{ fontSize: 16, color: "success.main" }} />
            ) : (
              <ArrowUpward sx={{ fontSize: 16, color: "error.main" }} />
            )}
            <Typography
              variant="body2"
              color={isPositive ? "success.main" : "error.main"}
              fontWeight={600}
            >
              R$ {Math.abs(value).toLocaleString("pt-BR")}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "percentual",
      headerName: "% do Orçamento",
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value as number;
        const isOverBudget = value > 100;
        
        return (
          <Box width="100%">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography
                variant="caption"
                color={isOverBudget ? "error.main" : "textPrimary"}
                fontWeight={600}
              >
                {value.toFixed(1)}%
              </Typography>
              {isOverBudget && (
                <Tooltip title="Acima do orçamento">
                  <Info sx={{ fontSize: 14, color: "error.main" }} />
                </Tooltip>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(value, 100)}
              color={isOverBudget ? "error" : value > 80 ? "warning" : "success"}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        );
      },
    },
    {
      field: "tendencia",
      headerName: "Tendência",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const tendencia = params.value as string;
        const getChipProps = () => {
          switch (tendencia) {
            case "up":
              return {
                icon: <TrendingUp />,
                label: "Alta",
                color: "error" as const,
              };
            case "down":
              return {
                icon: <TrendingDown />,
                label: "Baixa",
                color: "success" as const,
              };
            default:
              return {
                label: "Estável",
                color: "default" as const,
              };
          }
        };

        const chipProps = getChipProps();
        return <Chip size="small" {...chipProps} />;
      },
    },
  ];

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Análise por Categoria
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Comparação entre orçamento planejado e gastos reais
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Box height={400}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f0f0",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}