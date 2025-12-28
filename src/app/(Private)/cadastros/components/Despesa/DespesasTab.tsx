"use client";

import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconCreditCard,
  IconEdit,
  IconRepeat,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRef } from "react";
import { useDespesas } from "../../hooks/useDespesas";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

interface DespesasTabProps {
  despesas: Despesa[];
  categorias: Categoria[];
}

export default function DespesasTab({
  despesas,
  categorias,
}: DespesasTabProps) {
  const {
    isDeleting,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
    handleDelete,
    formProps,
  } = useDespesas({ despesas, categorias });

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 180;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleEditWithScroll = (despesa: Despesa) => {
    handleEdit(despesa, scrollToForm);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Formulario {...formProps} formRef={formRef} />
        </Grid>

        {/* Lista de Despesas */}
        <Grid item xs={12} md={8}>
          <Listagem
            despesas={despesas}
            handleEdit={handleEditWithScroll}
            handleDelete={handleDelete}
          />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      {/* <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <IconTrash size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Confirmar Exclusão
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta ação não pode ser desfeita
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a despesa{" "}
            <strong>"{deleteDialog.despesa?.nome}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            startIcon={<IconX size={16} />}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} />
              ) : (
                <IconTrash size={16} />
              )
            }
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}
