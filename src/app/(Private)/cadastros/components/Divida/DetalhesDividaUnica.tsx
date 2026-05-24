import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Grid,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  IconCreditCard,
  IconCalendarEvent,
  IconAlertCircle,
} from "@tabler/icons-react";
import { DividaUnica } from "@/core/dividas/types";

interface DetalhesDividaUnicaProps {
  divida: DividaUnica;
  cor: string;
  formatCurrency: (v: number) => string;
  fnFormatNaiveDate: (date: string | Date, formatStr: string) => string;
}

export const DetalhesDividaUnica = ({
  divida,
  cor,
  formatCurrency,
  fnFormatNaiveDate,
}: DetalhesDividaUnicaProps) => {
  const theme = useTheme();

  const valorPrincipal = Number(divida.valorTotal || 0);
  const valorPago = Number(divida.valorPago || 0);
  const valorRestante = Number(divida.valorRestante || 0);
  const progresso = divida.progresso || 0;

  const isAtrasada =
    divida.diasParaVencer !== null &&
    divida.diasParaVencer !== undefined &&
    divida.diasParaVencer < 0;

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(cor, 0.2)}`,
      }}
    >
      <Box sx={{ mb: 1 }}>
        {/* Header de Progresso Centrado */}
        <Stack spacing={0.5} alignItems="center" textAlign="center" mb={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: 1,
            }}
          >
            Progresso do Pagamento
          </Typography>
          <Box sx={{ py: 1 }}>
            <Typography
              variant="h3"
              fontWeight={900}
              color="success.main"
              sx={{
                lineHeight: 1,
                fontSize: { xs: "1.75rem", sm: "2.5rem" },
              }}
            >
              {formatCurrency(valorPago)}
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Box component="span" sx={{ color: cor, fontWeight: 900 }}>
              {progresso.toFixed(0)}%
            </Box>
            pago
          </Typography>
        </Stack>

        {/* Barra de Progresso */}
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progresso, 100)}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: alpha(cor, 0.1),
              "& .MuiLinearProgress-bar": {
                bgcolor: cor,
                borderRadius: 6,
                backgroundImage: `linear-gradient(90deg, ${alpha(cor, 0.6)} 0%, ${cor} 100%)`,
              },
            }}
          />
        </Box>

        {/* Rodapé de contexto */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack spacing={0}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ fontSize: "10px", textTransform: "uppercase" }}
            >
              Total Devido
            </Typography>
            <Typography
              variant="body2"
              fontWeight={800}
              sx={{ color: "text.primary" }}
            >
              {formatCurrency(valorPrincipal)}
            </Typography>
          </Stack>
          <Stack spacing={0} alignItems="flex-end">
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ fontSize: "10px", textTransform: "uppercase" }}
            >
              {valorRestante > 0 ? "Faltam" : "Status"}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={800}
              color={
                isAtrasada
                  ? "error.main"
                  : divida.diasParaVencer !== null &&
                    divida.diasParaVencer !== undefined &&
                    divida.diasParaVencer <= 7
                    ? "warning.main"
                    : "success.main"
              }
            >
              {valorRestante > 0 ? formatCurrency(valorRestante) : "Quitada! 🎉"}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Divider sx={{ my: 0, borderStyle: "dashed" }} />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={4}>
              <Stack spacing={0.5} alignItems="flex-start">
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <IconCreditCard
                    size={12}
                    color={theme.palette.text.secondary}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={800}
                    sx={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Parcelas
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  fontWeight={900}
                  sx={{ fontSize: "11px", color: "text.primary" }}
                >
                  {`${divida.parcelasPagas}/${divida.totalParcelas}`}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Stack spacing={0.5} alignItems="center">
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <IconCalendarEvent
                    size={12}
                    color={theme.palette.text.secondary}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={800}
                    sx={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Próximo
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  fontWeight={900}
                  sx={{
                    fontSize: "11px",
                    color: "text.primary",
                    textAlign: "center",
                  }}
                >
                  {divida.proximoVencimento
                    ? fnFormatNaiveDate(divida.proximoVencimento, "dd MMM yy")
                    : "---"}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Stack spacing={0.5} alignItems="flex-end">
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <IconAlertCircle
                    size={12}
                    color={theme.palette.text.secondary}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={800}
                    sx={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Situação
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  fontWeight={900}
                  sx={{
                    fontSize: "11px",
                    textAlign: "right",
                    color: isAtrasada
                      ? "error.main"
                      : divida.diasParaVencer !== null &&
                        (divida.diasParaVencer as number) <= 7
                        ? "warning.main"
                        : "success.main",
                  }}
                >
                  {isAtrasada
                    ? "Atrasada"
                    : divida.diasParaVencer === 0
                      ? "Vence hoje"
                      : divida.diasParaVencer !== null &&
                        (divida.diasParaVencer as number) <= 7
                        ? `Vence em ${divida.diasParaVencer}d`
                        : "Em dia"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
