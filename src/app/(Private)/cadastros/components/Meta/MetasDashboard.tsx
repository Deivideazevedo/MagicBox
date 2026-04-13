import { Meta } from "@/core/metas/types";
import {
  alpha,
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  useTheme,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  IconTarget,
  IconChartPie,
  IconCircleCheck,
  IconTrendingUp,
  IconPlus,
} from "@tabler/icons-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const SummaryCard = ({ title, value, subtitle, icon: Icon, color }: SummaryCardProps) => (
  <Card
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      border: "1px solid",
      borderColor: alpha(color, 0.2),
      background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -10,
        right: -10,
        opacity: 0.1,
        transform: "rotate(-15deg)",
      }}
    >
      <Icon size={80} stroke={1.5} color={color} />
    </Box>
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: "flex",
          }}
        >
          <Icon size={20} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Box>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

interface MetasDashboardProps {
  metas: Meta[];
  onNew: () => void;
  children: React.ReactNode;
}

export const MetasDashboard = ({ metas, onNew, children }: MetasDashboardProps) => {
  const theme = useTheme();

  const totalObjetivado = metas.reduce((acc, m) => acc + m.valorMeta, 0);
  const totalAcumulado = metas.reduce((acc, m) => acc + (m.valorAcumulado || 0), 0);
  const concluido = metas.filter((m) => (m.valorAcumulado || 0) >= m.valorMeta).length;
  const faltante = Math.max(totalObjetivado - totalAcumulado, 0);

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Box>
      {/* Totalizadores */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Objetivado"
            value={formatCurrency(totalObjetivado)}
            subtitle={`${metas.length} objetivos definidos`}
            icon={IconTarget}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Acumulado"
            value={formatCurrency(totalAcumulado)}
            subtitle="Valor já reservado"
            icon={IconTrendingUp}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Faltante"
            value={formatCurrency(faltante)}
            subtitle="Para atingir 100%"
            icon={IconChartPie}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Concluídas"
            value={concluido.toString()}
            subtitle="Metas atingidas"
            icon={IconCircleCheck}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Header da Listagem */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Seus Objetivos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie e acompanhe o progresso das suas metas financeiras
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          onClick={onNew}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
            fontWeight: 700,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
            "&:hover": {
              boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          Novo Objetivo
        </Button>
      </Stack>

      {/* Listagem (Children) */}
      <Box>{children}</Box>
    </Box>
  );
};

export default MetasDashboard;
