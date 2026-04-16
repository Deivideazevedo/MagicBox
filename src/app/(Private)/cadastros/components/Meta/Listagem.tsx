import { Meta } from "@/core/metas/types";
import {
  alpha,
  Box,
  Card,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Grid,
} from "@mui/material";
import {
  IconEdit,
  IconTrash,
  IconCoins,
  IconTarget,
  IconCalendar,
  IconTrendingUp,
} from "@tabler/icons-react";
import DashboardCard from "@/app/components/shared/DashboardCard";

interface ListagemProps {
  metas: Meta[];
  isLoading: boolean;
  onEdit: (meta: Meta) => void;
  onDelete: (id: number) => void;
  onAporte: (meta: Meta) => void;
}

export const Listagem = ({
  metas,
  isLoading,
  onEdit,
  onDelete,
  onAporte,
}: ListagemProps) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">Carregando seus objetivos...</Typography>
      </Box>
    );
  }

  if (metas.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 4,
          border: "2px dashed",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
            <IconTarget size={40} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Nenhum objetivo ainda</Typography>
            <Typography variant="body2" color="text.secondary">
              Suas metas aparecerão aqui para você acompanhar o progresso.
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Grid container spacing={3}>
      {metas.map((meta) => {
        const progresso = meta.progresso || 0;
        const cor = meta.cor || theme.palette.primary.main;
        const acumulado = meta.valorAcumulado || 0;
        const faltante = Math.max(meta.valorMeta - acumulado, 0);

        return (
          <Grid item xs={12} md={6} key={meta.id}>
            <DashboardCard>
              <Box p={3}>
                {/* Header do Card */}
                <Stack direction="row" spacing={2} alignItems="flex-start" mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: alpha(cor, 0.1),
                      color: cor,
                      boxShadow: `0 4px 12px ${alpha(cor, 0.2)}`,
                    }}
                  >
                    <IconTarget size={28} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                      {meta.nome}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <IconCalendar size={14} />
                        <Typography variant="caption" fontWeight={500}>
                          {meta.dataAlvo ? new Date(meta.dataAlvo).toLocaleDateString() : "Sem data"}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          bgcolor: alpha(cor, 0.1),
                          color: cor
                        }}
                      >
                        <Typography variant="caption" fontWeight={700}>
                          {progresso.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Fazer Aporte">
                      <IconButton
                        size="small"
                        onClick={() => onAporte(meta)}
                        sx={{
                          color: 'success.main',
                          '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                        }}
                      >
                        <IconCoins size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(meta)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                        }}
                      >
                        <IconEdit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(meta.id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                        }}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                {/* Info de Valores */}
                <Grid container spacing={2} mb={2.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                      ACUMULADO
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="success.main">
                      {formatCurrency(meta.valorAcumulado || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                      OBJETIVO
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {formatCurrency(meta.valorMeta)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Barra de Progresso */}
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha(cor, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: cor,
                        borderRadius: 5,
                        boxShadow: `0 2px 4px ${alpha(cor, 0.3)}`,
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {progresso >= 100 ? "Meta atingida! 🎉" : `${formatCurrency(faltante)} restantes`}
                    </Typography>
                    {progresso >= 100 && (
                      <Stack direction="row" spacing={0.5} alignItems="center" color="success.main">
                        <IconTrendingUp size={14} />
                        <Typography variant="caption" fontWeight={700}>Excelente!</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Box>
            </DashboardCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Listagem;
