"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  Fab,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import {
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";

const DrawerWidth = "480px";

export default function LancamentoDrawer() {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      {/* Botão Flutuante para abrir o drawer - Posicionado acima do botão de Settings */}
      <Tooltip title="Novo Lançamento">
        <Fab
          color="secondary"
          aria-label="novo-lancamento"
          sx={{ 
            position: "fixed", 
            right: "25px", 
            bottom: "85px" // 70px (altura do botão Settings) + 15px (espaçamento)
          }}
          onClick={() => setShowDrawer(true)}
        >
          <IconPlus stroke={1.5} />
        </Fab>
      </Tooltip>

      {/* Drawer Lateral */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{
          sx: {
            width: DrawerWidth,
          },
        }}
      >
        <Scrollbar sx={{ height: "calc(100vh - 5px)" }}>
          <Box
            p={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" fontWeight={600}>
              Novo Lançamento
            </Typography>

            <IconButton color="inherit" onClick={() => setShowDrawer(false)}>
              <IconX size="1rem" />
            </IconButton>
          </Box>
          <Divider />
          <Box p={3}>
            {/* <FormularioLancamento onClose={() => setShowDrawer(false)} /> */}
            <Typography>Formulário de lançamento em desenvolvimento</Typography>
          </Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}
