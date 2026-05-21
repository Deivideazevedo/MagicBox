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
import { IconTrendingDown, IconX } from "@tabler/icons-react";
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

function formatDiferenca(valor: number): string {
  const abs = Math.abs(valor);
  const formatted = formatCurrency(abs);
  if (valor > 0) return `+${formatted}`;
  if (valor < 0) return `-${formatted}`;
  return formatted;
}

interface DespesasDetailDialogProps {
  open: boolean;
  onClose: () => void;
  resumo: ResumoRelatorio | null;
}

export default function DespesasDetailDialog({
  open,
  onClose,
  resumo,
}: DespesasDetailDialogProps) {
  const theme = useTheme();

  if (!resumo) return null;

  const despesasPagas = resumo.despesasPagas ?? 0;
  const totalDespesas = resumo.totalDespesas ?? 0;
  const diffDespesas = despesasPagas - totalDespesas;
  
  const qtdDespesasAtivas = resumo.qtdDespesasAtivas ?? 0;
  const qtdDespesasInativas = resumo.qtdDespesasInativas ?? 0;
  const qtdDespesasTotal = resumo.qtdDespesasTotal ?? 0;

  // Se diffDespesas for negativo, gastamos MAIS do que o previsto (Erro/Estouro)
  // Se for positivo, gastamos MENOS do que o previsto (Sucesso/Economia)
  const diffColor =
    diffDespesas < 0
      ? theme.palette.error.main
      : diffDespesas > 0
      ? theme.palette.success.main
      : theme.palette.text.secondary;

  let diffDescription = "";
  if (diffDespesas < 0) {
    diffDescription = `Você pagou ${formatCurrency(Math.abs(diffDespesas))} a MAIS do que o total de agendamentos e projeções previsto para este período.`;
  } else if (diffDespesas > 0) {
    diffDescription = `Economia de ${formatCurrency(diffDespesas)}! Você gastou menos do que o total de agendamentos e projeções planejado.`;
  } else {
    diffDescription = "Você pagou exatamente o valor previsto de agendamentos e projeções.";
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="despesas-dialog-title"
      TransitionComponent={Transition}
      keepMounted
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
        id="despesas-dialog-title"
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
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              display: "flex",
            }}
          >
            <IconTrendingDown size={20} stroke={2} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Estruturação das Despesas
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
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
          Entenda detalhadamente como os seus gastos são exibidos no seu painel da MagicBox:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Bloco 1: Valor Efetivo Realizado */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="error.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Valor Realizado (Pago)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(Math.abs(despesasPagas))}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Este valor indica o total de pagamentos (despesas liquidadas) confirmados dentro do período filtrado. É o número principal exibido no card.
            </Typography>
          </Box>

          {/* Bloco 2: Valor Previsto */}
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
              Valor Previsto
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(Math.abs(totalDespesas))}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Representa a soma de todos os agendamentos ou projeções estimadas para o período. Caso o botão de "Exibir Projeções" esteja desativado, as projeções recorrentes são desconsideradas deste cálculo.
            </Typography>
          </Box>

          {/* Bloco 3: Diferença */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(diffColor, 0.03),
              border: "1px solid",
              borderColor: alpha(diffColor, 0.15),
            }}
          >
            <Typography
              variant="caption"
              color={diffColor}
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Diferença (Economia ou Estouro)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatDiferenca(diffDespesas)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              {diffDescription}
            </Typography>
          </Box>

          {/* Bloco 4: Contas de Despesas */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="info.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 1.5,
              }}
            >
              Status das Contas de Despesas
            </Typography>

            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ativas
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="error.main"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasAtivas}
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  pl: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Inativas
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.secondary"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasInativas}
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  pl: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Geral
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasTotal}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Visão quantitativa de todas as contas ou categorias de despesa cadastradas e monitoradas na sua conta.
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
