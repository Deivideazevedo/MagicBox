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
import { IconCreditCard, IconWallet } from "@tabler/icons-react";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";

// Components
import DespesasTab from "./components/Despesa/DespesasTab";
import ReceitasTab from "./components/Receita/ReceitasTab";
import MetasTab from "./components/Meta/MetasTab";
import { IconCategory, IconTarget } from "@tabler/icons-react";
import CategoriasTab from "./components/Categoria/CategoriasTab";
import DividasTab from "./components/Divida/DividasTab";
import { DividasTourProvider } from "./components/Divida/DividasTourContext";
import { useGetMetasQuery } from "@/services/endpoints/metasApi";

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
    data: receitas = [],
    isLoading: loadingReceitas,
    error: errorReceitas,
  } = useGetReceitasQuery();
  const {
    data: metas = [],
    isLoading: loadingMetas,
    error: errorMetas,
  } = useGetMetasQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const isLoading = loadingCategorias || loadingDespesas || loadingReceitas || loadingMetas;
  const error = errorCategorias || errorDespesas || errorReceitas || errorMetas;

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
    <Container maxWidth={false} sx={{ px: { xs: 0, md: 2 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Cadastros
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie suas categorias, receitas, metas e dívidas
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
              label="Receitas"
              icon={<IconWallet size={20} />}
              iconPosition="start"
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab
              label="Metas"
              icon={<IconTarget size={20} />}
              iconPosition="start"
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab
              label="Dívidas"
              icon={<IconCreditCard size={20} />}
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
          <ReceitasTab receitas={receitas} />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <MetasTab />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <DividasTourProvider>
            <DividasTab />
          </DividasTourProvider>
        </TabPanel>
      </Paper>
    </Container>
  );
}
