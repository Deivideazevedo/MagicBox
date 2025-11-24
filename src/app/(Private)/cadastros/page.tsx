"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { IconBuilding, IconCreditCard, IconWallet } from "@tabler/icons-react";

// Components (serão criados separadamente)
import CategoriasTab from "./components/CategoriasTab";
import DespesasTab from "./components/DespesasTab";
import FontesRendaTab from "./components/FontesRendaTab";

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Cadastros
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Gerencie suas categorias, despesas e fontes de renda de forma organizada
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="cadastros tabs"
            sx={{ px: 3, pt: 2 }}
          >
            <Tab
              label="Categorias"
              icon={<IconBuilding size={20} />}
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
          <CategoriasTab />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <DespesasTab />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <FontesRendaTab />
        </TabPanel>
      </Paper>
    </Container>
  );
}