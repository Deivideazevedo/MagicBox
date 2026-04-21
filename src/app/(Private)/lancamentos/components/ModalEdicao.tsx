"use client";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconX, IconEdit } from "@tabler/icons-react";
import { LancamentoResposta } from "@/core/lancamentos/types";
import Formulario from "./formularios";

interface ModalEdicaoProps {
  open: boolean;
  lancamento: LancamentoResposta | null;
  onClose: () => void;
}

export default function ModalEdicao({
  open,
  lancamento,
  onClose,
}: ModalEdicaoProps) {
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
              backgroundColor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <IconEdit size={24} />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>
              Editar Lançamento
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Atualize as informações do lançamento
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* Usando o container modular que já gerencia seu próprio hook */}
        <Formulario 
          lancamentoParaEditar={lancamento} 
          onSuccess={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
}
