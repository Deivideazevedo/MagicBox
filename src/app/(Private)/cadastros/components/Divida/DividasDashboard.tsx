import { ResumoDividas, Divida } from "@/core/dividas/types";
import { ProductTourButton } from "@/app/components/shared/ProductTour";
import { useDividasTourRefs } from "./DividasTourContext";
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

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: SummaryCardProps) => (
  <Card
    elevation={1}
    sx={{
      p: { xs: 1.5, sm: 2.5 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: alpha(color, 0.2),
      background: `background.paper`,
      position: "relative",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
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
    <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: "space-between" }}>
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.5 }}
        alignItems="flex-start"
      >
        <Box
          sx={{
            p: { xs: 0.5, sm: 1 },
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: "flex",
          }}
        >
          <Icon size={20} />
        </Box>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight={600}
          sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
        >
          {title}
        </Typography>
      </Stack>
      <Box mt={1}>
        <Typography
          variant="h5"
          fontWeight={800}
          color="text.primary"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.5rem" },
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            lineHeight: 1.2,
            display: "block",
            mt: 0.5,
          }}
        >
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
  onStartTour?: () => void;
  showTourButton?: boolean;
}

export const DividasDashboard = ({
  resumo,
  onNew,
  children,
  mostrarConcluidas = false,
  onToggleConcluidas,
  onStartTour,
  showTourButton = false,
}: DividasDashboardProps) => {
  const theme = useTheme();
  const tourRefs = useDividasTourRefs();

  const formatCurrency = (val: number) =>
    (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const safeResumo = {
    totalDevidoGlobal: Number(resumo?.totalDevidoGlobal || 0),
    quantidadeDevidoGlobal: Number(resumo?.quantidadeDevidoGlobal || 0),
    totalPagoMes: Number(resumo?.totalPagoMes || 0),
    totalAmortizadoGlobal: Number(resumo?.totalAmortizadoGlobal || 0),
    valorTotalAPagarMes: Number(resumo?.valorTotalAPagarMes || 0),
    quantidadeTotalAPagarMes: Number(resumo?.quantidadeTotalAPagarMes || 0),
    dividasAtrasadas: Number(resumo?.dividasAtrasadas || 0),
    valorAtrasado: Number(resumo?.valorAtrasado || 0),
  };

  return (
    <Box>
      {/* Totalizadores */}
      <Box
        ref={tourRefs.resumoRef as React.Ref<HTMLDivElement>}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Total em Dívidas"
              value={formatCurrency(safeResumo.totalDevidoGlobal)}
              subtitle={`${safeResumo.quantidadeDevidoGlobal} dívidas pendentes`}
              icon={IconCreditCard}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Total a Pagar no Mês"
              value={formatCurrency(safeResumo.valorTotalAPagarMes)}
              subtitle={`${safeResumo.quantidadeTotalAPagarMes} vencimento${safeResumo.quantidadeTotalAPagarMes > 1 || safeResumo.quantidadeTotalAPagarMes === 0 ? 's' : ''} neste mês`}
              icon={IconCalendarEvent}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Total Pago"
              value={formatCurrency(safeResumo.totalPagoMes)}
              subtitle={`Total global amortizado: ${formatCurrency(safeResumo.totalAmortizadoGlobal)}`}
              icon={IconTrendingUp}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Atrasadas"
              value={formatCurrency(safeResumo.valorAtrasado)}
              subtitle={`${safeResumo.dividasAtrasadas} dívida${safeResumo.dividasAtrasadas > 1 || safeResumo.dividasAtrasadas === 0 ? 's' : ''} com prazo expirado`}
              icon={IconAlertTriangle}
              color={theme.palette.error.main}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Header da Listagem */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ letterSpacing: "-0.5px", color: "text.primary" }}
            >
              Suas Dívidas com Prazo
            </Typography>
            {showTourButton && (
              <ProductTourButton
                buttonRef={tourRefs.tituloRef}
                onClick={onStartTour || (() => {})}
                title="Deseja ver como funciona?"
              />
            )}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            Gerencie a evolução e o encerramento de suas dívidas
          </Typography>
        </Box>
        <Stack
          ref={tourRefs.acoesRef as React.Ref<HTMLDivElement>}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 0.8,
            pl: { xs: 1.5, sm: 2.5 },
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.8)
                : "#fff",
            borderRadius: "20px",
            boxShadow: theme.shadows[1],
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
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
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  ml: 0,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                Concluídas
              </Typography>
            }
            sx={{ m: 0, mx: { xs: 0, sm: 1 } }}
          />

          <Box
            sx={{
              width: "1px",
              height: "28px",
              bgcolor: "divider",
              opacity: 0.4,
            }}
          />

          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={onNew}
            sx={{
              borderRadius: "14px",
              py: 1.2,
              px: 3,
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              fontSize: { xs: "12px", sm: "14px" },
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
              "&:hover": {
                boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
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
