import { ResumoDividas, Divida } from "@/core/dividas/types";
import {
  alpha,
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  useTheme,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  IconCreditCard,
  IconAlertTriangle,
  IconCircleCheck,
  IconTrendingUp,
  IconPlus,
  IconCalendarEvent,
} from "@tabler/icons-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
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

interface DividasDashboardProps {
  resumo: ResumoDividas;
  onNew: () => void;
  children: React.ReactNode;
  mostrarConcluidas?: boolean;
  onToggleConcluidas?: (val: boolean) => void;
}

export const DividasDashboard = ({
  resumo,
  onNew,
  children,
  mostrarConcluidas = false,
  onToggleConcluidas
}: DividasDashboardProps) => {
  const theme = useTheme();

  const formatCurrency = (val: number) =>
    (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const safeResumo = {
    totalDevidoUnicas: Number(resumo?.totalDevidoUnicas || 0),
    totalPagoUnicas: Number(resumo?.totalPagoUnicas || 0),
    totalAgendadoVolateis: Number(resumo?.totalAgendadoVolateis || 0),
    quantidadeTotalParcelas: Number(resumo?.quantidadeTotalParcelas || 0),
    dividasAtrasadas: Number(resumo?.dividasAtrasadas || 0),
    proximosVencimentos: Number(resumo?.proximosVencimentos || 0),
  };

  return (
    <Box>
      {/* Totalizadores */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total em Dívidas"
            value={formatCurrency(safeResumo.totalDevidoUnicas + safeResumo.totalAgendadoVolateis)}
            subtitle={`${safeResumo.quantidadeTotalParcelas} parcelas restantes`}
            icon={IconCreditCard}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Pago"
            value={formatCurrency(safeResumo.totalPagoUnicas)}
            subtitle="Valor amortizado"
            icon={IconTrendingUp}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Atrasadas"
            value={safeResumo.dividasAtrasadas}
            subtitle="Dívidas com vencimento expirado"
            icon={IconAlertTriangle}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Próximos 7 dias"
            value={safeResumo.proximosVencimentos}
            subtitle="Vencimentos próximos"
            icon={IconCalendarEvent}
            color={theme.palette.warning.main}
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
            Suas Dívidas com Prazo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            Gerencie a evolução e o encerramento de suas dívidas
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
            Nova Dívida
          </Button>
        </Stack>
      </Stack>

      {/* Listagem (Children) */}
      <Box>{children}</Box>
    </Box>
  );
};

export default DividasDashboard;
