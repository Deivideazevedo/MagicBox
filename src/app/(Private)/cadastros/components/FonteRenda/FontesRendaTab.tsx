"use client";

import { FonteRenda } from "@/core/fontesRenda/types";
import { Box, Grid, Typography } from "@mui/material";
import { useRef } from "react";
import { useFontesRenda } from "../../hooks/useFontesRenda";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { IconTrash } from "@tabler/icons-react";

interface FontesRendaTabProps {
  fontesRenda: FonteRenda[];
}

export default function FontesRendaTab({
  fontesRenda,
}: FontesRendaTabProps) {
  const { handleEdit, formProps, listProps, deleteProps } = useFontesRenda({
    fontesRenda,
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

  const handleEditWithScroll = (fonteRenda: FonteRenda) => {
    handleEdit(fonteRenda, scrollToForm);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Formulario {...formProps} formRef={formRef} />
        </Grid>

        {/* Lista de Fontes de Renda */}
        <Grid item xs={12} md={8}>
          <Listagem {...listProps} handleEdit={handleEditWithScroll} />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Fonte de Renda?"
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
