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
import { IconTarget, IconX } from "@tabler/icons-react";
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

interface MetasDetailDialogProps {
  open: boolean;
  onClose: () => void;
  resumo: ResumoRelatorio | null;
}

export default function MetasDetailDialog({
  open,
  onClose,
  resumo,
}: MetasDetailDialogProps) {
  const theme = useTheme();

  if (!resumo) return null;

  const totalAcumuladoComAlvo = resumo.totalAcumuladoMetasComAlvo ?? 0;
  const totalPlanejado = resumo.totalPlanejadoMetas ?? 0;
  const acumuloLivre = resumo.totalAcumuladoMetasSemAlvo ?? 0;
  const totalAcumulado = resumo.totalAcumuladoMetas ?? 0;
  const qtdMetasTotal = resumo.qtdMetasTotal ?? 0;
  const qtdMetasConcluidas = resumo.qtdMetasConcluidas ?? 0;
  const qtdMetasEmAndamento = resumo.qtdMetasEmAndamento ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="metas-dialog-title"
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
        id="metas-dialog-title"
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
              bgcolor: alpha(theme.palette.info.main, 0.12),
              color: theme.palette.info.main,
              display: "flex",
            }}
          >
            <IconTarget size={20} stroke={2} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Estruturação das Metas
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
          Entenda detalhadamente como os montantes de metas são exibidos no seu
          painel da MagicBox:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Bloco 1: Valor no Período */}
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
              Valor do Período
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(resumo.totalMetas)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Este valor indica quanto foi guardado especificamente dentro do
              período filtrado. É o número principal em destaque no topo do
              card.
            </Typography>
          </Box>

          {/* Bloco 2: Metas Planejadas */}
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
                mb: 1.5,
              }}
            >
              Metas Planejadas
            </Typography>

            <Grid container spacing={2} sx={{ mb: 1.5 }}>
              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                  }}
                >
                  Total Guardado
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="success.main"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {formatCurrency(totalAcumuladoComAlvo)}
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  pl: 2,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                  }}
                >
                  Alvo Previsto
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {formatCurrency(totalPlanejado)}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Objetivos financeiros estruturados (ex: comprar um carro, viagem
              de férias). Possuem data limite definida e valor de alvo final.
            </Typography>
          </Box>

          {/* Bloco 3: Acúmulo Livre */}
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
              Acúmulo Livre
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(acumuloLivre)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Poupança livre e descompromissada, ideal para criar reservas
              financeiras gerais sem a necessidade de estipular prazos ou
              limites finais.
            </Typography>
          </Box>

          {/* Bloco 4: Total Consolidado */}
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
              Total Geral (Saldo Consolidado)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(totalAcumulado)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Soma de todos os valores planejados e livres adicionados até hoje.
              Representa o patrimônio total guardado no módulo de metas.
            </Typography>
          </Box>

          {/* Bloco 5: Status das Metas */}
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
                mb: 1.5,
              }}
            >
              Status das Metas
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
                  Em Andamento
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="primary.main"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdMetasEmAndamento}
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
                  Concluídas
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="success.main"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdMetasConcluidas}
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
                  {qtdMetasTotal}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Visão quantitativa de todos os seus objetivos cadastrados e
              monitorados ativamente no sistema.
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
