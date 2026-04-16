"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Chip,
  alpha,
} from "@mui/material";
import {
  IconX,
  IconCalendar,
  IconChecks,
  IconCurrencyReal,
  IconNotes,
  IconTag,
  IconReceipt,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";

interface ModalVisualizacaoProps {
  open: boolean;
  lancamento: LancamentoResposta | null;
  despesas: Despesa[];
  receitas: Receita[];
  onClose: () => void;
}

export default function ModalVisualizacao({
  open,
  lancamento,
  despesas,
  receitas,
  onClose,
}: ModalVisualizacaoProps) {
  if (!lancamento) return null;

  // Usar dados do Prisma (despesa, fonteRenda já vêm populados)
  const despesa = lancamento.despesa;
  const receita = lancamento.receita;

  const isPagamento = lancamento.tipo === "pagamento";
  const isDespesa = Boolean(lancamento.despesa);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    color = "primary",
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    color?: "primary" | "success" | "error" | "info" | "warning";
  }) => (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <Icon size={16} color={`var(--mui-palette-${color}-main)`} />
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={500} pl={3}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: (theme) =>
                alpha(theme.palette[isPagamento ? "success" : "warning"].main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: `${isPagamento ? "success" : "warning"}.main`,
            }}
          >
            {isPagamento ? <IconChecks size={24} /> : <IconCalendar size={24} />}
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>
              Detalhes do Lançamento
            </Typography>
            <Chip
              size="small"
              label={isPagamento ? "Pagamento" : "Agendamento"}
              color={isPagamento ? "success" : "warning"}
              sx={{ mt: 0.5, fontWeight: 600 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          {/* Valor */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: (theme) =>
                alpha(theme.palette[isDespesa ? "error" : "success"].main, 0.08),
              border: "1px solid",
              borderColor: (theme) =>
                alpha(theme.palette[isDespesa ? "error" : "success"].main, 0.2),
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: `${isDespesa ? "error" : "success"}.main`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <IconCurrencyReal size={20} />
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight={600}>
                  Valor
                </Typography>
                <Typography variant="h4" fontWeight={700} color={`${isDespesa ? "error" : "success"}.main`}>
                  {formatarValor(Number(lancamento.valor))}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Informações Gerais */}
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <InfoItem
                icon={IconCalendar}
                label="Data"
                value={formatarData(lancamento.data)}
                color="info"
              />
            </Grid>


            <Grid item xs={12}>
              <InfoItem
                icon={IconReceipt}
                label={isDespesa ? "Despesa" : "Receita"}
                value={despesa?.nome || receita?.nome || "-"}
                color={isDespesa ? "error" : "success"}
              />
            </Grid>

            {lancamento.observacao && (
              <Grid item xs={12}>
                <InfoItem
                  icon={IconNotes}
                  label="Obersavação"
                  value={lancamento.observacao}
                  color="info"
                />
              </Grid>
            )}

            {lancamento.observacaoAutomatica && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                    border: "1px solid",
                    borderColor: (theme) => alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <IconNotes size={16} color="var(--mui-palette-info-main)" />
                    <Typography variant="caption" color="info.main" fontWeight={600}>
                      Observação Automática (Parcelamento)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {lancamento.observacaoAutomatica}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Metadados */}
          <Divider />
          <Box>
            <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>
              Criado em: {formatarData(lancamento.createdAt)}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              Atualizado em: {formatarData(lancamento.updatedAt)}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<IconX size={16} />}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
