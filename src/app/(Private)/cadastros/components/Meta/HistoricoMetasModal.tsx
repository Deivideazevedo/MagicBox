import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { IconX, IconArrowUpRight, IconArrowDownLeft, IconHistory } from "@tabler/icons-react";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { LancamentoResposta } from "@/core/lancamentos/types";

interface HistoricoMetasModalProps {
  open: boolean;
  onClose: () => void;
  metaId: number;
  metaNome: string;
}

const HistoricoMetasModal = ({ open, onClose, metaId, metaNome }: HistoricoMetasModalProps) => {
  const theme = useTheme();

  const { data: lancamentosRes, isLoading } = useGetLancamentosQuery({
    metaId,
    limit: 100,
    page: 0,
  }, { skip: !open });

  const lancamentos = (lancamentosRes as any)?.data || [];

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconHistory size={24} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="h6" fontWeight={700}>Movimentações</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>{metaNome}</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress size={32} />
          </Box>
        ) : lancamentos.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">Nenhuma movimentação encontrada para esta meta.</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
            {lancamentos.map((l: LancamentoResposta, index: number) => {
              const isRetirada = l.valor < 0;
              const cor = isRetirada ? theme.palette.error.main : theme.palette.success.main;
              
              return (
                <Box key={l.id}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    sx={{ 
                      p: 2, 
                      transition: "bgcolor 0.2s",
                      "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.05) }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: "12px", 
                        bgcolor: alpha(cor, 0.1), 
                        color: cor,
                        display: "flex"
                      }}
                    >
                      {isRetirada ? <IconArrowDownLeft size={20} /> : <IconArrowUpRight size={20} />}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {isRetirada ? "Retirada" : "Aporte"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(l.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="subtitle2" fontWeight={800} color={cor}>
                        {isRetirada ? "-" : "+"} {formatCurrency(Math.abs(l.valor))}
                      </Typography>
                      {l.observacao && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.observacao}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {index < lancamentos.length - 1 && <Divider sx={{ mx: 2, opacity: 0.5 }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoMetasModal;
