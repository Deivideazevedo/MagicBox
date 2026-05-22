import React from "react";
import {
  Box,
  Typography,
  Grid,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { IconScale, IconX } from "@tabler/icons-react";
import { ResumoRelatorio } from "@/core/relatorios/relatorio.dto";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

interface SaldoLivreDetailDialogProps {
  open: boolean;
  onClose: () => void;
  resumo: ResumoRelatorio | null;
}

export default function SaldoLivreDetailDialog({
  open,
  onClose,
  resumo,
}: SaldoLivreDetailDialogProps) {
  const theme = useTheme();

  if (!resumo) return null;

  const saldoLivreGeral = resumo.saldoLivreGeral ?? 0;
  const saldoLivrePeriodo = resumo.saldoLivre ?? 0;
  const saldoBrutoLiquido = resumo.saldoBrutoLiquido ?? 0;
  const taxaEconomia = resumo.taxaEconomiaPeriodo ?? 0;

  const proporcaoPeriodo =
    saldoLivreGeral > 0 ? (saldoLivrePeriodo / saldoLivreGeral) * 100 : 0;
  const diferencaFuros = saldoLivrePeriodo - saldoLivreGeral;
  const totalEconomizadoPeriodo = saldoLivrePeriodo + (resumo.totalMetas ?? 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="saldo-livre-dialog-title"
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "flex-end", sm: "center" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: "24px 24px 0 0", sm: 4 },
          p: 1.5,
          width: "100%",
          maxWidth: { xs: "100%", sm: 450 },
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: "85vh", sm: "90vh" },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.1),
          boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.25)}`,
        },
      }}
    >
      <DialogTitle
        id="saldo-livre-dialog-title"
        sx={{
          p: 2,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              p: 0.7,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              display: "flex",
            }}
          >
            <IconScale size={20} stroke={2} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Composição do Saldo Livre
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          pt: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.85rem", mb: 0.5 }}
        >
          Entenda detalhadamente a composição e as relações do seu saldo livre,
          poupança e liquidez geral na MagicBox:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Bloco 1: Saldo Livre (Disponível Hoje) */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Saldo Livre (Disponível Hoje)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(saldoLivreGeral)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              É a quantia disponível hoje para gastar. Fruto da soma de todas as
              suas receitas pagas - despesas e metas guardadas, independente do
              período filtrado.
            </Typography>
          </Box>

          {/* Bloco 2: Saldo no Período */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="success.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Saldo no Período
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(saldoLivrePeriodo)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              É quanto sobrou no intervalo de datas selecionado, obtido através
              de (Receitas - Metas e Despesas pagas no período).
            </Typography>
          </Box>

          {/* Bloco 3: Total Acumulado (Saldo Livre + Metas) */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="warning.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Total Acumulado (Saldo Livre + Metas)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(saldoBrutoLiquido)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              É a soma de todo o seu saldo livre disponível hoje mais o dinheiro
              guardado em metas. Composto por:{" "}
              <strong>{formatCurrency(saldoLivreGeral)}</strong> (Saldo Livre) +{" "}
              <strong>{formatCurrency(resumo.totalAcumuladoMetas ?? 0)}</strong>{" "}
              (guardados em Metas).
            </Typography>
          </Box>

          {/* Bloco 4: Economia no Período */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.secondary.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.secondary.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="secondary.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Economia no Período
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{
                mb: 1,
                letterSpacing: -0.5,
                display: "flex",
                alignItems: "baseline",
                gap: 1,
              }}
            >
              {taxaEconomia.toFixed(1)}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Representa o percentual total da sua renda recebida neste período
              que você conseguiu salvar. É composto pela soma da sua Sobra no
              Período (<strong>{formatCurrency(saldoLivrePeriodo)}</strong>)
              mais o valor guardado em Metas neste período (
              <strong>{formatCurrency(resumo.totalMetas ?? 0)}</strong>),
              totalizando{" "}
              <strong>{formatCurrency(totalEconomizadoPeriodo)}</strong>{" "}
              economizados.
            </Typography>
          </Box>

          {/* Bloco 5: Furos de Meses Anteriores */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(
                proporcaoPeriodo > 100
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                0.03,
              ),
              border: "1px solid",
              borderColor: alpha(
                proporcaoPeriodo > 100
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                0.15,
              ),
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Typography
                variant="caption"
                color={proporcaoPeriodo > 100 ? "error.main" : "success.main"}
                fontWeight={700}
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Furos de Meses Anteriores
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: alpha(
                    proporcaoPeriodo > 100
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                    0.1,
                  ),
                  color: proporcaoPeriodo > 100 ? "error.main" : "success.main",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {proporcaoPeriodo > 100
                  ? "⚠️ Furo Detectado"
                  : "✅ Caixa Saudável"}
              </Box>
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color={proporcaoPeriodo > 100 ? "error.main" : "success.main"}
              sx={{
                mb: 1,
                letterSpacing: -0.5,
                display: "flex",
                alignItems: "baseline",
                gap: 1,
              }}
            >
              {proporcaoPeriodo > 100
                ? `-${formatCurrency(diferencaFuros)}`
                : "R$ 0,00"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Compara o seu saldo neste período com o seu saldo total livre
              disponível hoje.
              {proporcaoPeriodo > 100 ? (
                <>
                  {" "}
                  Você economizou{" "}
                  <strong>{formatCurrency(saldoLivrePeriodo)}</strong> no
                  período selecionado, mas o seu saldo acumulado hoje é de
                  apenas <strong>{formatCurrency(saldoLivreGeral)}</strong>.
                  Isso significa que uma diferença de{" "}
                  <strong>{formatCurrency(diferencaFuros)}</strong> foi
                  consumida para cobrir{" "}
                  <strong>
                    furos, despesas não pagas ou saldos negativos de meses
                    passados
                  </strong>
                  , reduzindo seu caixa disponível.
                </>
              ) : (
                <>
                  {" "}
                  Como a sua economia no período (
                  <strong>{formatCurrency(saldoLivrePeriodo)}</strong>) é menor
                  do que seu saldo total acumulado (
                  <strong>{formatCurrency(saldoLivreGeral)}</strong>), seu caixa
                  está equilibrado e em pleno crescimento, sem furos ou rombos
                  de meses passados consumindo sua sobra financeira.
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
