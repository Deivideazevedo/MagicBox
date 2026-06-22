"use client";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useObterDestinatariosLoteQuery } from "@/services/endpoints/disparosApi";
import { LogDestinatario, LogLote } from "@/core/disparos/types";

interface DestinatariosDialogProps {
  log: LogLote;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de detalhes dos destinatários de um lote.
 *
 * É montado/desmontado a cada abertura (a página o renderiza condicionalmente com
 * `key={log.id}`), então a requisição dispara na montagem e nunca exibe os dados
 * do lote anterior — o loading aparece corretamente para o lote atual.
 */
export function DestinatariosDialog({
  log,
  open,
  onClose,
}: DestinatariosDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: destinatarios = [], isLoading } =
    useObterDestinatariosLoteQuery(log.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, p: { xs: 0, sm: 1 } } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800}>
            Destinatários do Disparo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Lote #{log.id} • Origem:{" "}
            {log.origem === "CRON" ? "Automático" : "Manual"} • Realizado em{" "}
            {new Date(log.createdAt).toLocaleString("pt-BR")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {log.mensagemErro && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              Erro Geral do Disparo
            </AlertTitle>
            {log.mensagemErro}
          </Alert>
        )}

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={5}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Usuário</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Telefone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Canal</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Erro do Envio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {destinatarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                      Nenhum detalhe individual registrado para este lote.
                    </TableCell>
                  </TableRow>
                ) : (
                  destinatarios.map((detalhe: LogDestinatario) => (
                    <TableRow key={detalhe.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {detalhe.user?.name || "Usuário"}
                      </TableCell>
                      <TableCell>{detalhe.user?.email || "-"}</TableCell>
                      <TableCell>{detalhe.user?.phone || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={detalhe.canal}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, height: 20, fontSize: "10px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            detalhe.status === "BARRADO"
                              ? "Barrado"
                              : detalhe.status
                          }
                          size="small"
                          color={
                            detalhe.status === "ENVIADO"
                              ? "success"
                              : detalhe.status === "FALHOU"
                                ? "error"
                                : detalhe.status === "BARRADO"
                                  ? "warning"
                                  : "default"
                          }
                          sx={{ fontWeight: 700, height: 20, fontSize: "10px" }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            detalhe.status === "BARRADO"
                              ? "warning.dark"
                              : "error.main",
                          fontSize: "12px",
                        }}
                      >
                        {detalhe.mensagemErro || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, lineHeight: 1.6 }}
        >
          <strong>Legenda:</strong> <strong>Enviado</strong> = entregue ao
          provedor do canal. <strong>Falhou</strong> = erro no envio (ver coluna
          de erro). <strong>Barrado</strong> = o usuário desativou esse canal nas
          preferências dele, então o envio não foi realizado (não é falha).
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
