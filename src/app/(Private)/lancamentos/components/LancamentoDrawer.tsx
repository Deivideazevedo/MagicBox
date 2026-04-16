"use client";

import { useLancamentoForm } from "../hooks/useLancamentoForm";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import Formulario from "./Formulario";
import { useDispatch, useSelector } from "@/store/hooks";
import { SwalToast, Swalert } from "@/utils/swalert";
import { AppState } from "@/store/store";
import {
  abrirDrawer,
  fecharDrawer,
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

  // Hook do formulário — agora passamos o initialData vindo do Redux
  const formProps = useLancamentoForm({
    lancamentoParaEditar: modo === "editar" ? dadosIniciais : null,
    onSuccess: () => dispatch(fecharDrawer()),
  });
  
  const { setFocus, setOrigem, reset, defaultValues, setValue } = formProps;

  // Se o modo for 'pay', precisamos pré-configurar o formulário
  useEffect(() => {
    if (estaAberto && modo === "pagar" && dadosIniciais) {
      // Configura a origem (despesa ou receita)
      setOrigem(dadosIniciais.origem);
      
      // Reseta com valores da projeção
      reset({
        ...defaultValues,
        itemId: dadosIniciais.origemId,
        valor: dadosIniciais.valorPrevisto,
        data: new Date().toISOString().split("T")[0], // Data de hoje para pagamento
        tipo: "pagamento",
        observacao: `Pagamento: ${dadosIniciais.nome}`,
      });
    }
  }, [estaAberto, modo, dadosIniciais, reset, defaultValues, setOrigem]);

  const handleCloseDrawer = useCallback(() => {
    dispatch(fecharDrawer());
    setTimeout(() => {
      setOrigem("despesa");
      reset(defaultValues);
    }, 300);
  }, [dispatch, reset, defaultValues, setOrigem]);

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
        SlideProps={{
          onEntered: () => setFocus("itemId"),
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
              {modo === "editar" ? "Editar Lançamento" : modo === "pagar" ? "Efetuar Pagamento" : "Novo Lançamento"}
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
