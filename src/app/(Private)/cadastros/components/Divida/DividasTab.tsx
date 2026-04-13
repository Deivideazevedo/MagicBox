"use client";

import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { Box, Grid, Typography } from "@mui/material";
import { useDividas } from "../../hooks/useDividas";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { IconTrash } from "@tabler/icons-react";

interface DividasTabProps {
  despesas: Despesa[];
  categorias: Categoria[];
}

export default function DividasTab({
  despesas,
  categorias,
}: DividasTabProps) {
  const { handleEdit, formProps, listProps, deleteProps } = useDividas({
    despesas,
    categorias,
  });

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Formulario {...formProps} />
        </Grid>

        {/* Lista de Dívidas */}
        <Grid item xs={12} md={8}>
          <Listagem {...listProps} />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Dívida?"
        icon={IconTrash}
        color="warning"
      >
        <Typography variant="body1" color="text.secondary">
          Você está prestes a remover{" "}
          <Box
            component="span"
            fontWeight="bold"
            fontSize={15}
            color="text.primary"
          >
            "{deleteProps.name}"
          </Box>
          .<br /> Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </Box>
  );
}
