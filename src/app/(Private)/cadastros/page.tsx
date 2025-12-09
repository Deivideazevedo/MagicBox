"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { IconBuilding, IconCreditCard, IconWallet } from "@tabler/icons-react";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetFontesRendaQuery } from "@/services/endpoints/fontesRendaApi";

// Components
import CategoriasTab from "./components/CategoriasTab";
import DespesasTab from "./components/DespesasTab";
import FontesRendaTab from "./components/FontesRendaTab";
import { IconCategory } from "@tabler/icons-react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cadastros-tabpanel-${index}`}
      aria-labelledby={`cadastros-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CadastrosPage() {
  const [currentTab, setCurrentTab] = useState(0);

  // Pré-carrega todos os dados de uma vez para evitar loading ao trocar tabs
  const {
    data: categorias = [],
    isLoading: loadingCategorias,
    error: errorCategorias,
  } = useGetCategoriasQuery();
  const {
    data: despesas = [],
    isLoading: loadingDespesas,
    error: errorDespesas,
  } = useGetDespesasQuery();
  const {
    data: fontesRenda = [],
    isLoading: loadingFontesRenda,
    error: errorFontesRenda,
  } = useGetFontesRendaQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const isLoading = loadingCategorias || loadingDespesas || loadingFontesRenda;
  const error = errorCategorias || errorDespesas || errorFontesRenda;

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          Erro ao carregar dados. Tente novamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Cadastros
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie suas categorias, despesas e fontes de renda de forma
          organizada
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="cadastros tabs"
            variant="scrollable"
            // scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ px: 3, pt: 2 }}
          >
            <Tab
              label="Categorias"
              icon={<IconCategory size={20} />}
              iconPosition="start"
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab
              label="Despesas"
              icon={<IconCreditCard size={20} />}
              iconPosition="start"
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab
              label="Fontes de Renda"
              icon={<IconWallet size={20} />}
              iconPosition="start"
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <CategoriasTab categorias={categorias} />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <DespesasTab despesas={despesas} categorias={categorias} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <FontesRendaTab fontesRenda={fontesRenda} />
        </TabPanel>
      </Paper>
    </Container>
  );
}
