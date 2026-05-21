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

  const proporcaoPeriodo = saldoLivreGeral > 0 ? (saldoLivrePeriodo / saldoLivreGeral) * 100 : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="saldo-livre-dialog-title"
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
          Entenda detalhadamente a composição e as relações do seu saldo livre, poupança e liquidez geral na MagicBox:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Bloco 1: Saldo Livre Geral (Disponível Hoje) */}
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
              Saldo Livre Geral (Disponível Hoje)
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
              É o seu dinheiro líquido real disponível hoje para gastar. Soma todas as suas receitas históricas pagas e subtrai despesas e metas quitadas, independente do período filtrado.
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
              Saldo Livre no Período
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
              Representa o saldo gerado no intervalo de datas selecionado (Receitas - Metas - Despesas pagas no período). É o valor que alimenta o progresso.
            </Typography>
          </Box>

          {/* Bloco 3: Proporção do Período */}
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
                mb: 0.5,
              }}
            >
              Proporção do Período
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {proporcaoPeriodo.toFixed(1)}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Mede a contribuição do período atual em relação ao seu Saldo Livre Geral acumulado. O percentual pode exceder 100% caso haja saldos negativos em períodos passados.
            </Typography>
          </Box>

          {/* Bloco 4: Livre + Metas (Saldo Bruto Líquido) */}
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
              Livre + Metas (Saldo Bruto Líquido)
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
              Corresponde ao seu patrimônio líquido total acumulado (todas as receitas pagas históricas - despesas pagas históricas). Une sua liquidez livre atual mais o montante protegido nas metas.
            </Typography>
          </Box>

          {/* Bloco 5: Taxa de Economia */}
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
              Taxa de Economia
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {taxaEconomia.toFixed(1)}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              O percentual da renda recebida neste período que você conseguiu salvar (permanecendo livre na conta ou investido em objetivos de metas).
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
