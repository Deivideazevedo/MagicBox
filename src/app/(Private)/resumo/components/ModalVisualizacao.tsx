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
  useTheme,
} from "@mui/material";
import {
  IconX,
  IconCalendar,
  IconCurrencyReal,
  IconNotes,
  IconReceipt,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconClock,
  IconHistory,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ResumoResposta } from "@/core/lancamentos/resumo/types";
import { IconTag } from "@tabler/icons-react";

interface ModalVisualizacaoProps {
  open: boolean;
  lancamento: ResumoResposta | null;
  onClose: () => void;
}

export default function ModalVisualizacao({
  open,
  lancamento,
  onClose,
}: ModalVisualizacaoProps) {
  const theme = useTheme();
  if (!lancamento) return null;

  const isDespesa = lancamento.origem === "despesa";
  const corPrincipal = isDespesa ? theme.palette.error.main : theme.palette.success.main;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarDataCompleta = (data: string) => {
    try {
      return format(new Date(data), "HH:mm'h' - dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, backgroundImage: 'none' },
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                backgroundColor: alpha(corPrincipal, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: corPrincipal,
              }}
            >
              {isDespesa ? <IconArrowDownLeft size={24} /> : <IconArrowUpRight size={24} />}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {lancamento.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Referência: {lancamento.mes.toString().padStart(2, '0')}/{lancamento.ano}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.disabled' }}>
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Card de Valores */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                  VALOR PREVISTO
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatarMoeda(lancamento.valorPrevisto)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 2, bgcolor: alpha(corPrincipal, 0.05), borderRadius: 3, border: `1px solid ${alpha(corPrincipal, 0.1)}` }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                  VALOR REALIZADO
                </Typography>
                <Typography variant="h6" fontWeight={800} color={corPrincipal}>
                  {formatarMoeda(lancamento.valorPago)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Status e Origem */}
          <Stack direction="row" gap={1}>
            <Chip 
              icon={<IconTag size={16} />} 
              label={isDespesa ? "Despesa" : "Receita/Renda"} 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={lancamento.status} 
              color={lancamento.atrasado ? "error" : "primary"} 
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          {/* Seção de Histórico/Detalhes */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconHistory size={18} /> Histórico de Movimentações
            </Typography>
            
            <Stack spacing={1.5}>
              {lancamento.detalhes && lancamento.detalhes.length > 0 ? (
                lancamento.detalhes.map((det) => (
                  <Box 
                    key={det.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconClock size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          {formatarDataCompleta(det.data)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {det.observacao || (det.tipo === 'pagamento' ? 'Pagamento efetuado' : 'Lançamento registrado')}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={800} color={det.tipo === 'pagamento' ? 'success.main' : 'text.primary'}>
                      {formatarMoeda(det.valor)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Nenhuma movimentação detalhada encontrada.
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          color="inherit"
          sx={{ 
            borderRadius: 2, 
            textTransform: "none", 
            fontWeight: 700,
            bgcolor: theme.palette.grey[200],
            '&:hover': { bgcolor: theme.palette.grey[300] }
          }}
        >
          Fechar Visualização
        </Button>
      </DialogActions>
    </Dialog>
  );
}