import { Objetivo } from "@/core/objetivos/types";
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

interface ObjetivosDashboardProps {
  objetivos: Objetivo[];
  onNew: () => void;
  children: React.ReactNode;
  mostrarConcluidas?: boolean;
  onToggleConcluidas?: (val: boolean) => void;
}

export const ObjetivosDashboard = ({
  objetivos,
  onNew,
  children,
  mostrarConcluidas = false,
  onToggleConcluidas,
}: ObjetivosDashboardProps) => {
  const theme = useTheme();

  const totalObjetivado = objetivos.reduce(
    (acc, m) =>
      acc +
      (m.status === "A" && m.tipo === "META"
        ? Number(m.valorObjetivo || 0)
        : 0),
    0,
  );
  const totalAcumulado = objetivos.reduce(
    (acc, m) => acc + Number(m.valorAcumulado || 0),
    0,
  );
  const concluidasCount = objetivos.filter((m) => m.status === "I").length;
  const atingidasCount = objetivos.filter(
    (m) =>
      m.status === "A" &&
      m.tipo === "META" &&
      Number(m.valorAcumulado || 0) >= Number(m.valorObjetivo || 0),
  ).length;

  const totalObjetivoMetas = objetivos.reduce(
    (acc, m) =>
      acc +
      (m.status === "A" && m.tipo === "META"
        ? Number(m.valorObjetivo || 0)
        : 0),
    0,
  );
  const totalAcumuladoMetasAtivas = objetivos.reduce(
    (acc, m) =>
      acc +
      (m.status === "A" && m.tipo === "META"
        ? Number(m.valorAcumulado || 0)
        : 0),
    0,
  );
  const faltante = Math.max(totalObjetivoMetas - totalAcumuladoMetasAtivas, 0);

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const metasAtivasCount = objetivos.filter(
    (m) => m.status === "A" && m.tipo === "META",
  ).length;
  const reservasAtivasCount = objetivos.filter(
    (m) => m.status === "A" && m.tipo === "RESERVA",
  ).length;

  return (
    <Box>
      {/* Totalizadores */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <SummaryCard
            title="Total Objetivado"
            value={formatCurrency(totalObjetivado)}
            subtitle={`${metasAtivasCount} metas ativas`}
            icon={IconTarget}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <SummaryCard
            title="Total Guardado"
            value={formatCurrency(totalAcumulado)}
            subtitle={`${reservasAtivasCount} reservas ativas`}
            icon={IconTrendingUp}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <SummaryCard
            title="Faltante (Metas)"
            value={formatCurrency(faltante)}
            subtitle="Para atingir 100%"
            icon={IconChartPie}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <SummaryCard
            title="Concluídos"
            value={concluidasCount.toString()}
            subtitle={`${atingidasCount} atingidos (elegíveis)`}
            icon={IconCircleCheck}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Header da Listagem */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ letterSpacing: "-0.5px", color: "text.primary" }}
          >
            Seus Objetivos
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            Gerencie e acompanhe o progresso dos seus objetivos e reservas
            financeiras
          </Typography>
        </Box>

        <Stack
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
                Concluídos
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
            startIcon={<IconPlus size={16} />}
            onClick={onNew}
            sx={{
              borderRadius: "14px",
              py: 1.2,
              px: { xs: 2, sm: 3 },
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
            Novo Objetivo
          </Button>
        </Stack>
      </Stack>

      {/* Listagem (Children) */}
      <Box>{children}</Box>
    </Box>
  );
};

export default ObjetivosDashboard;
