"use client";

import Formulario from "./formularios";
import CustomScrollbar from "@/app/components/custom-scroll/Scrollbar";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  fecharDrawer,
  abrirDrawer,
} from "@/store/apps/lancamentos/LancamentoSlice";
import {
  Box,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useCallback, useEffect } from "react";

const DrawerWidth = "420px";

export default function LancamentoDrawer() {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Estado Global do Drawer
  const { estaAberto, modo, dadosIniciais } = useSelector((state: AppState) => state.lancamentoUi);

  // Função para fechar e resetar
  const handleCloseDrawer = useCallback(() => {
    dispatch(fecharDrawer());
  }, [dispatch]);

  const lancamentoParaEditar = modo === "editar" ? dadosIniciais : null;
  const initialOrigem = modo === "pagar" ? dadosIniciais?.origem : "despesa";

  return (
    <>
      {/* Botão Flutuante (Usando Redux) */}
      <Tooltip title="Novo Lançamento">
        <Fab
          color="primary"
          aria-label="novo-lancamento"
          sx={{
            position: "fixed",
            right: "25px",
            bottom: "15px",
          }}
          onClick={() => dispatch(abrirDrawer({ modo: "novo" }))}
        >
          <IconPlus stroke={1.5} />
        </Fab>
      </Tooltip>

      {/* Drawer Lateral */}
      <Drawer
        anchor="right"
        open={estaAberto}
        onClose={handleCloseDrawer}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer,
        }}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: "400px",
              md: DrawerWidth,
            },
            maxWidth: "100vw",
            background: theme.palette.grey[100],
          },
        }}
      >
        <CustomScrollbar sx={{ minHeight: "calc(100vh - 170px)" }}>
          <Box
            p={2.3}
            px={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 0,
            }}
          >
            <Typography variant="h4" fontWeight={600} color="primary">
              {modo === "editar" ? "Editar Lançamento" : modo === "pagar" ? "Efetuar Pagamento" : "Novo Lançamento"}
            </Typography>

            <IconButton color="inherit" onClick={handleCloseDrawer}>
              <IconX size="1rem" />
            </IconButton>
          </Box>

          <Divider />

          {/* Key garante que o formulário resete ao fechar/abrir */}
          <Formulario 
            key={estaAberto ? 'aberto' : 'fechado'}
            lancamentoParaEditar={lancamentoParaEditar}
            onSuccess={handleCloseDrawer}
            initialOrigem={initialOrigem}
            dadosIniciais={modo === "pagar" ? dadosIniciais : null}
          />
        </CustomScrollbar>
      </Drawer>
    </>
  );
}
