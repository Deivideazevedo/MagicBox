"use client";

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  IconArrowRight,
  IconPlus,
  IconDotsVertical,
  IconCreditCard,
  IconReceipt2,
  IconChartPie,
  IconRotateClockwise,
} from "@tabler/icons-react";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Swal from "sweetalert2";

const DividasPage = () => {
  const dataInicio = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: allDespesas = [], isLoading: loadingDespesas } = useGetDespesasQuery();
  const { data: dashboard } = useGetDashboardQuery({ dataInicio, dataFim });
  
  // Filtra apenas despesas do tipo DIVIDA
  const dividas = allDespesas.filter(d => d.tipo === "DIVIDA" && !d.deletedAt);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = {
    totalDevedor: dividas.reduce((acc, d) => acc + (Number(d.valorTotal) || 0), 0),
    totalPago: 0,
    quantidade: dividas.length
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="text.primary">Dívidas e Financiamentos</Typography>
        <Typography variant="body1" color="text.secondary">Controle seus passivos e planeje a quitação de parcelas</Typography>
      </Box>

      {/* Grid de Resumo */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid", borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Saldo Devedor Total</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {formatCurrency(stats.totalDevedor)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: "6px solid", borderColor: "primary.main" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Dívidas Ativas</Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.quantidade}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>Lista de Passivos</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          sx={{ borderRadius: 2, textTransform: "none" }}
          onClick={() => Swal.fire("Em breve", "Funcionalidade de criação direta em desenvolvimento", "info")}
        >
          Nova Dívida
        </Button>
      </Box>

      <Grid container spacing={3}>
        {dividas.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={10} bgcolor="action.hover" borderRadius={4}>
              <IconChartPie size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <Typography color="text.secondary">Nenhuma dívida cadastrada no momento.</Typography>
            </Box>
          </Grid>
        )}
        
        {dividas.map((divida) => {
          const total = Number(divida.valorTotal) || 0;
          const estimado = Number(divida.valorEstimado) || 0;

          return (
            <Grid item xs={12} md={6} key={divida.id}>
              <Card elevation={3} sx={{ borderRadius: 4, overflow: "hidden" }}>
                <CardContent sx={{ p: 0 }}>
                  <Box p={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: `${divida.cor}20` || "primary.light", 
                            color: divida.cor || "primary.main",
                            borderRadius: 2
                          }}
                        >
                          <IconReceipt2 size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{divida.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Vence todo dia {divida.diaVencimento}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton size="small"><IconDotsVertical size={20} /></IconButton>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Valor Total</Typography>
                        <Typography variant="body1" fontWeight={700}>{formatCurrency(total)}</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="caption" color="text.secondary">Parcela Mensal</Typography>
                        <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency(estimado)}</Typography>
                      </Grid>
                    </Grid>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Progresso de Quitação</Typography>
                        <Typography variant="caption" fontWeight={700}>Calculando...</Typography>
                      </Box>
                      <LinearProgress 
                        variant="indeterminate" 
                        sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }} 
                      />
                    </Box>
                  </Box>

                  <Box bgcolor="action.hover" p={2} display="flex" gap={2}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      startIcon={<IconCreditCard size={18} />}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Pagar Parcela
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      startIcon={<IconRotateClockwise size={18} />}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Amortizar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DividasPage;
