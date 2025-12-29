"use client";

import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { Box, Grid, Typography } from "@mui/material";
import { useRef } from "react";
import { useDespesas } from "../../hooks/useDespesas";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { IconTrash } from "@tabler/icons-react";

interface DespesasTabProps {
  despesas: Despesa[];
  categorias: Categoria[];
}

export default function DespesasTab({
  despesas,
  categorias,
}: DespesasTabProps) {
  const { handleEdit, formProps, listProps, deleteProps } = useDespesas({
    despesas,
    categorias,
  });

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
    handleEdit(despesa);
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
          <Listagem {...listProps} />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Despesa?"
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
            "{deleteProps.open?.nome}"
          </Box>
          .<br /> Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </Box>
  );
}
