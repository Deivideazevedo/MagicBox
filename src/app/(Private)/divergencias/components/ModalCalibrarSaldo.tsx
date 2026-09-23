"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  IconScale,
  IconX,
  IconArrowRight,
  IconAlertTriangle,
  IconCheck,
  IconFocusCentered,
} from "@tabler/icons-react";

interface ModalCalibrarSaldoProps {
  open: boolean;
  onClose: () => void;
  saldoLivreGeral: number;
  onConfirm: (saldoReal: number) => Promise<void>;
  loading?: boolean;
  onFocusConciliador?: () => void;
}

function formatCurrency(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function ModalCalibrarSaldo({
  open,
  onClose,
  saldoLivreGeral,
  onConfirm,
  loading = false,
  onFocusConciliador,
}: ModalCalibrarSaldoProps) {
  const theme = useTheme();
  const [saldoRealStr, setSaldoRealStr] = useState("");

  const saldoRealNum = useMemo(() => {
    if (!saldoRealStr.trim()) return undefined;
    const clean = saldoRealStr.replace(/\s/g, "").replace(",", ".");
    const val = parseFloat(clean);
    return isNaN(val) ? undefined : val;
  }, [saldoRealStr]);

  const diferenca = useMemo(() => {
    if (saldoRealNum === undefined) return undefined;
    return saldoRealNum - saldoLivreGeral;
  }, [saldoRealNum, saldoLivreGeral]);

  const handleConfirmar = async () => {
    if (saldoRealNum === undefined) return;
    await onConfirm(saldoRealNum);
    setSaldoRealStr("");
    onClose();
  };

  const handleIrParaConciliador = () => {
    onClose();
    if (onFocusConciliador) {
      setTimeout(() => {
        onFocusConciliador();
      }, 150);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <IconScale size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Calibrar Saldo com Conta Bancária
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conciliação Bancária Expressa
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Card explicativo de contexto contábil */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(
                saldoLivreGeral < 0 ? theme.palette.error.main : theme.palette.info.main,
                0.06
              ),
              border: `1px solid ${alpha(
                saldoLivreGeral < 0 ? theme.palette.error.main : theme.palette.info.main,
                0.2
              )}`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Saldo Livre Calculado no MagicBox:
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  color: saldoLivreGeral < 0 ? "error.main" : "text.primary",
                }}
              >
                {formatCurrency(saldoLivreGeral)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Para igualar o sistema à realidade da sua conta bancária, informe o saldo disponível
              visível hoje no seu banco. O sistema criará um <strong>Ajuste de Conciliação autônomo</strong>{" "}
              (sem alterar despesas ou receitas já cadastradas) para alinhar seu saldo livre perfeitamente.
            </Typography>
          </Box>

          {/* Campo de entrada de saldo bancário real */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Saldo Real Visível na sua Conta Corrente:
            </Typography>
            <TextField
              fullWidth
              autoFocus
              value={saldoRealStr}
              onChange={(e) => setSaldoRealStr(e.target.value)}
              placeholder="Ex: 50.00 ou 1250,50"
              variant="outlined"
              size="medium"
              disabled={loading}
              helperText="Digite o valor exato visível no extrato ou saldo do seu aplicativo de banco."
            />
          </Box>

          {/* Prévia dinâmica da calibração */}
          {diferenca !== undefined && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(
                  diferenca >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  0.07
                ),
                border: `1px dashed ${alpha(
                  diferenca >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  0.3
                )}`,
              }}
            >
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Saldo Bancário Informado:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(saldoRealNum!)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Ajuste Necessário ({diferenca >= 0 ? "Crédito / Entrada" : "Débito / Saída"}):
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      color: diferenca >= 0 ? "success.main" : "error.main",
                    }}
                  >
                    {diferenca >= 0 ? "+" : ""}
                    {formatCurrency(diferenca)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Novo Saldo Livre Após Calibração:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                    {formatCurrency(saldoRealNum!)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Atalho alternativo */}
          {onFocusConciliador && (
            <Box display="flex" justifyContent="center">
              <Button
                variant="text"
                size="small"
                startIcon={<IconFocusCentered size={16} />}
                onClick={handleIrParaConciliador}
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                Ou preencher diretamente no painel do Conciliador Expresso
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color={diferenca !== undefined && diferenca < 0 ? "error" : "primary"}
          disabled={loading || saldoRealNum === undefined || Math.abs(diferenca ?? 0) < 0.01}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
          sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}
        >
          {loading ? "Calibrando..." : "Confirmar Calibração"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
