"use client";

import { useCategorias } from "@/app/(Private)/cadastros/hooks/useCategorias";
import { useDespesas } from "@/app/(Private)/cadastros/hooks/useDespesas";
import { useFontesRenda } from "@/app/(Private)/cadastros/hooks/useFontesRenda";
import { useLancamentoForm } from "../hooks/useLancamentoForm";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import Formulario from "./Formulario";
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
import { useCallback, useState } from "react";

const DrawerWidth = "420px";

export default function LancamentoDrawer() {
  const theme = useTheme();
  const [showDrawer, setShowDrawer] = useState(false);

  // Hooks de dados
  const { formProps: categoriasFormProps } = useCategorias();
  const { listProps: despesasListProps } = useDespesas();
  const { listProps: fontesRendaListProps } = useFontesRenda();

  const categoriasList = categoriasFormProps?.categorias || [];
  const despesasList = despesasListProps?.despesas || [];
  const fontesRendaList = fontesRendaListProps?.fontesRenda || [];

  // Hook do formulário
  const formProps = useLancamentoForm({
    categorias: categoriasList,
    despesas: despesasList,
    fontesRenda: fontesRendaList,
  });

  const { setFocus } = formProps;

  const handleOpenDrawer = useCallback(() => {
    setShowDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
    formProps.setOrigem("despesa");
    setTimeout(() => {
      formProps.reset(formProps.defaultValues);
    }, 300);
  }, [formProps]);

  return (
    <>
      {/* Botão Flutuante */}
      <Tooltip title="Novo Lançamento">
        <Fab
          color="primary"
          aria-label="novo-lancamento"
          sx={{
            position: "fixed",
            right: "25px",
            bottom: "15px",
          }}
          onClick={handleOpenDrawer}
        >
          <IconPlus stroke={1.5} />
        </Fab>
      </Tooltip>

      {/* Drawer Lateral */}
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={handleCloseDrawer}
        sx={{
          zIndex: 999,
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
        SlideProps={{
          onEntered: () => setFocus("categoriaId"),
        }}
      >
        <Scrollbar
          sx={{
            minHeight: "calc(100vh - 170px)",
          }}
        >
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
              Novo Lançamento
            </Typography>

            <IconButton color="inherit" onClick={handleCloseDrawer}>
              <IconX size="1rem" />
            </IconButton>
          </Box>

          <Divider />

          <Formulario {...formProps} />
        </Scrollbar>
      </Drawer>
    </>
  );
}
