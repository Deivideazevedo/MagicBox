import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import Link from "next/link";
import SearchOffIcon from "@mui/icons-material/SearchOff";

/**
 * Página 404 - Não Encontrado
 * Exibida quando uma rota não existe
 */
const NotFound = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}
  >
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Ícone ou Imagem */}
          <Box sx={{ position: "relative", width: "100%", maxWidth: "400px" }}>
            <Image
              src="/images/backgrounds/errorimg.svg"
              alt="404 - Página não encontrada"
              width={400}
              height={300}
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </Box>

          <SearchOffIcon sx={{ fontSize: "4rem" }} color="primary" />
          
          <Typography variant="h2" component="h1" fontWeight="700">
            Oops! Página Não Encontrada
          </Typography>
          
          <Typography color="text.secondary" variant="h6" sx={{ maxWidth: "500px" }}>
            A página que você está procurando não existe ou foi movida para outro endereço.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Button
              color="primary"
              variant="contained"
              component={Link}
              href="/dashboard"
              size="large"
            >
              Ir para o Dashboard
            </Button>
            
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              href="/"
              size="large"
            >
              Voltar ao Início
            </Button>
          </Stack>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
            Código de erro: 404
          </Typography>
        </Stack>
      </Paper>
    </Container>
  </Box>
);

export default NotFound;
