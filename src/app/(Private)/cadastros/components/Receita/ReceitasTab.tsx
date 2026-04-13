"use client";

import { Receita } from "@/core/receitas/types";
import { Box, Grid, Typography } from "@mui/material";
import { useRef } from "react";
import { useReceitas } from "../../hooks/useReceitas";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { IconTrash } from "@tabler/icons-react";

interface ReceitasTabProps {
  receitas: Receita[];
}

export default function ReceitasTab({
  receitas,
}: ReceitasTabProps) {
  const { handleEdit, formProps, listProps, deleteProps } = useReceitas({
    receitas,
  });

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Formulario {...formProps} />
        </Grid>

        {/* Lista de Receitas */}
        <Grid item xs={12} md={8}>
          <Listagem {...listProps} />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Receita?"
        icon={IconTrash}
        color="error"
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
