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
  FormControlLabel,
  Switch,
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
    elevation={1}
    sx={{
      p: 2.5,
      borderRadius: 4,
      border: "1px solid",
      borderColor: alpha(color, 0.2),
      background: `background.paper`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -4,
        right: -4,
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
  mostrarConcluidas?: boolean;
  onToggleConcluidas?: (val: boolean) => void;
}

export const MetasDashboard = ({
  metas,
  onNew,
  children,
  mostrarConcluidas = false,
  onToggleConcluidas
}: MetasDashboardProps) => {
  const theme = useTheme();

  const totalObjetivado = metas.reduce((acc, m) => acc + (m.status === 'A' ? Number(m.valorMeta) : 0), 0);
  const totalAcumulado = metas.reduce((acc, m) => acc + Number(m.valorAcumulado), 0);
  const concluido = metas.filter((m) => m.status === 'I' || Number(m.valorAcumulado) >= Number(m.valorMeta)).length;
  const faltante = Math.max(totalObjetivado - metas.reduce((acc, m) => acc + (m.status === 'A' ? Number(m.valorAcumulado) : 0), 0), 0);

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
            title="Total Guardado"
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
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px', color: 'text.primary' }}>
            Seus Objetivos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            Gerencie e acompanhe o progresso das suas metas financeiras
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 0.8,
            pl: 2.5,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : '#fff',
            borderRadius: '20px',
            boxShadow: theme.shadows[1],
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={mostrarConcluidas}
                onChange={(e) => onToggleConcluidas?.(e.target.checked)}
                size="small"
                color="primary"
              />
            }
            label={
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', ml: 0, letterSpacing: '0.5px' }}>
                Concluídas
              </Typography>
            }
            sx={{ m: 0, mx: 1 }}
          />

          <Box sx={{ width: '1px', height: '28px', bgcolor: 'divider', opacity: 0.4 }} />

          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={onNew}
            sx={{
              borderRadius: '14px',
              py: 1.2,
              px: 3,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
              "&:hover": {
                boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Novo Objetivo
          </Button>
        </Stack>
      </Stack>

      {/* Listagem (Children) */}
      <Box>{children}</Box>
    </Box>
  );
};

export default MetasDashboard;
