"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import { IconCurrencyReal, IconReceipt, IconCalendar } from "@tabler/icons-react";

// Components
import TabelaLancamentos from "./components/TabelaLancamentos";
import FormularioLancamento from "./components/FormularioLancamento";

// Hooks
import { useLancamentos } from "./hooks/useLancamentos";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";

export default function LancamentosPage() {
  const {
    lancamentos,
    handleEdit,
    handleDelete,
    isDeleting,
  } = useLancamentos();

  const { data: despesas = [] } = useGetDespesasQuery();
  const { data: categorias = [] } = useGetCategoriasQuery();

  // Calcular totais
  const valorTotalPrevisto = lancamentos.reduce((acc, lanc) => acc + Number(lanc.valor), 0);
  const valorTotalPago = lancamentos.reduce((acc, lanc) => acc + Number(lanc.valorPago || 0), 0);
  const totalLancamentos = lancamentos.length;

  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Lançamentos
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Registre pagamentos e agende despesas futuras
          </Typography>
        </Box>

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <IconReceipt size={24} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total de Lançamentos
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {totalLancamentos}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: "warning.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <IconCalendar size={24} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Valor Previsto
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      R$ {valorTotalPrevisto.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: "success.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <IconCurrencyReal size={24} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Valor Pago
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      R$ {valorTotalPago.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Formulário e Tabela */}
        <Grid container spacing={3}>
          {/* Formulário de Lançamento */}
          <Grid item xs={12} lg={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                bgcolor: (theme) => alpha(theme.palette.primary.light, 0.05),
                position: "sticky",
                top: 24,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      backgroundColor: "primary.main",
                      color: "white",
                    }}
                  >
                    <IconReceipt size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Novo Lançamento
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Cadastro rápido
                    </Typography>
                  </Box>
                </Box>
                <FormularioLancamento />
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela de Lançamentos */}
          <Grid item xs={12} lg={8}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="h6" fontWeight={600}>
                    Extrato de Lançamentos
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Visualize, edite ou exclua seus lançamentos
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <TabelaLancamentos
                    lancamentos={lancamentos}
                    despesas={despesas}
                    categorias={categorias}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}