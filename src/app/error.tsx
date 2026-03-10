"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Página de erro global da aplicação (App Router)
 * Captura erros de runtime em qualquer rota
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loga o erro no console (pode enviar para serviço de monitoramento)
    console.error("Error captured:", error);
  }, [error]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}
    >
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <ErrorOutlineIcon sx={{ fontSize: "5rem" }} color="error" />
            
            <Typography variant="h3" component="h1" fontWeight="700">
              Algo deu errado!
            </Typography>
            
            <Typography color="text.secondary" variant="body1">
              Um erro inesperado ocorreu ao processar sua solicitação.
            </Typography>

            {/* Mostra detalhes do erro apenas em desenvolvimento */}
            {process.env.NODE_ENV === "development" && (
              <Box
                sx={{
                  width: "100%",
                  p: 2,
                  bgcolor: "grey.200",
                  borderRadius: 1,
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                >
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={reset}
                size="large"
              >
                Tentar Novamente
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                href="/"
                size="large"
              >
                Voltar ao Início
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
