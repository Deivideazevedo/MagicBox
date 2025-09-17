"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useMonthlyChart } from "../hooks/useMonthlyChart";

const MonthlyChart = () => {
  const theme = useTheme();
  const { 
    monthlyData, 
    loading, 
    currentMonth, 
    totalReceitas, 
    totalDespesas, 
    saldoTotal, 
    percentualSaldo 
  } = useMonthlyChart();

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.receitas, m.despesas)));

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
              Receitas vs Despesas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comparativo dos últimos 6 meses
            </Typography>
          </Box>
          
          <Box textAlign="right">
            <Typography 
              variant="h5" 
              fontWeight={700} 
              color={saldoTotal >= 0 ? theme.palette.success.main : theme.palette.error.main}
              gutterBottom
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(saldoTotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentualSaldo}% do total
            </Typography>
          </Box>
        </Box>

        {/* Gráfico simples com CSS */}
        <Box sx={{ height: 280 }}>
          <Box display="flex" alignItems="end" height="100%" gap={1}>
            {monthlyData.map((month, index) => (
              <Box 
                key={index} 
                flex={1} 
                display="flex" 
                flexDirection="column" 
                alignItems="center"
                height="100%"
              >
                {/* Barras */}
                <Box 
                  display="flex" 
                  alignItems="end" 
                  width="100%" 
                  height="85%" 
                  gap={0.5}
                  justifyContent="center"
                >
                  {/* Barra Receitas */}
                  <Box
                    sx={{
                      width: 16,
                      height: `${(month.receitas / maxValue) * 100}%`,
                      backgroundColor: theme.palette.success.main,
                      borderRadius: 1,
                      minHeight: month.receitas > 0 ? 8 : 0,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: theme.palette.success.dark,
                        transform: "scaleY(1.05)"
                      }
                    }}
                  />
                  {/* Barra Despesas */}
                  <Box
                    sx={{
                      width: 16,
                      height: `${(month.despesas / maxValue) * 100}%`,
                      backgroundColor: theme.palette.error.main,
                      borderRadius: 1,
                      minHeight: month.despesas > 0 ? 8 : 0,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: theme.palette.error.dark,
                        transform: "scaleY(1.05)"
                      }
                    }}
                  />
                </Box>
                
                {/* Label do mês */}
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 1, textTransform: 'capitalize' }}
                >
                  {month.month}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Legenda */}
        <Box display="flex" justifyContent="center" gap={3} mt={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: theme.palette.success.main, 
                borderRadius: 1 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              Receitas
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: theme.palette.error.main, 
                borderRadius: 1 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              Despesas
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;