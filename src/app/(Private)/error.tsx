"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect } from "react";

interface PrivateErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Página de erro para rotas privadas (Dashboard)
 * Captura erros específicos dentro das rotas autenticadas
 */
export default function PrivateError({ error, reset }: PrivateErrorProps) {
  useEffect(() => {
    // Loga o erro (pode enviar para serviço de monitoramento)
    console.error("Private route error:", error);
  }, [error]);
  console.log("error", Object.keys(error));

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "calc(100vh - 170px)" }}
    >
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 5, borderRadius: 3 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <WarningAmberIcon sx={{ fontSize: "5rem" }} color="warning" />

            <Typography variant="h3" component="h1" fontWeight="600">
              Erro ao Carregar Dados!
            </Typography>

            <Typography
              color="text.secondary"
              variant="body1"
              sx={{ maxWidth: "500px" }}
            >
              Ocorreu um erro ao processar sua solicitação. Isso pode ter
              acontecido devido a um problema temporário de conexão ou dados
              inválidos.
            </Typography>

            {/* Mostra detalhes do erro apenas em desenvolvimento */}
            {process.env.NODE_ENV === "development" && (
              <Box
                sx={{
                  width: "100%",
                  p: 2,
                  bgcolor: "warning.lighter",
                  borderRadius: 1,
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: "300px",
                  border: "1px solid",
                  borderColor: "warning.light",
                }}
              >
                <Typography
                  variant="overline"
                  color="warning.dark"
                  fontWeight="600"
                  display="block"
                  mb={1}
                >
                  Detalhes do Erro (Desenvolvimento)
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "text.primary",
                    whiteSpace: "preserve-breaks",
                    wordBreak: "break-word",
                  }}
                >
                  <b>Mensagem:</b> {error.message}
                  {error.stack && `\n\nStack: ${error.stack}`}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </Typography>
              </Box>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={reset}
                size="large"
                startIcon={<RefreshIcon />}
              >
                Tentar Novamente
              </Button>

              <Button
                variant="outlined"
                color="primary"
                href="/dashboard"
                size="large"
                startIcon={<HomeIcon />}
              >
                Voltar ao Dashboard
              </Button>
            </Stack>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
              Se o problema persistir, entre em contato com o suporte.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
