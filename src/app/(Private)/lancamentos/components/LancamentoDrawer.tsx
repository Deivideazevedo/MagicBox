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
  Button,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { IconPlus, IconX, IconSquarePlus } from "@tabler/icons-react";
import { useCallback, useEffect } from "react";

const DrawerWidth = "420px";

export default function LancamentoDrawer() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Estado Global do Drawer
  const { estaAberto, modo, dadosIniciais } = useSelector(
    (state: AppState) => state.lancamentoUi,
  );

  // Função para fechar e resetar
  const handleCloseDrawer = useCallback(() => {
    dispatch(fecharDrawer());
  }, [dispatch]);

  const lancamentoParaEditar = modo === "editar" ? dadosIniciais : null;
  const initialOrigem = modo === "pagar" ? dadosIniciais?.origem : "despesa";

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          right: 0,
          bottom: "15px",
          zIndex: 1100,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => dispatch(abrirDrawer({ modo: "novo" }))}
          sx={{
            borderRadius: "24px 0 0 24px",
            minWidth: "48px",
            height: "48px",
            p: 0,
            pl: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            boxShadow: (theme) => theme.shadows[1],
            border: "1px solid",
            borderRight: "none",
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .label": {
              maxWidth: 0,
              opacity: 0,
              whiteSpace: "nowrap",
              transition: "all 0.3s",
              fontWeight: 600,
            },
            "&:hover": {
              pr: 2,
              boxShadow: (theme) =>
                `-6px 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: "translateX(-4px)",
              "& .label": {
                maxWidth: "200px",
                opacity: 1,
              },
            },
          }}
        >
          <IconSquarePlus size="22" stroke="2" />
          <span className="label">Novo Lançamento</span>
        </Button>
      </Box>

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
              {modo === "editar"
                ? "Editar Lançamento"
                : modo === "pagar"
                  ? "Efetuar Pagamento"
                  : "Novo Lançamento"}
            </Typography>

            <IconButton color="inherit" onClick={handleCloseDrawer}>
              <IconX size="1rem" />
            </IconButton>
          </Box>

          <Divider />

          {/* Key garante que o formulário resete ao fechar/abrir */}
          <Formulario
            key={estaAberto ? "aberto" : "fechado"}
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
