import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { Categoria } from "@/core/categorias/types";
import {
  Box,
  Grid,
  Typography
} from "@mui/material";
import {
  IconTrash
} from "@tabler/icons-react";
import { useRef } from "react";
import { useCategorias } from "../../hooks/useCategorias";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

interface CategoriasTabProps {
  categorias: Categoria[];
}

export default function CategoriasTab({ categorias }: CategoriasTabProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const { formProps, listProps, deleteProps } =
    useCategorias({ categorias });


  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={4}>
          <Formulario {...formProps} formRef={formRef} />
        </Grid>

        {/* Lista de Categorias */}
        <Grid item xs={12} md={8}>
          <Listagem {...listProps} />
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Categoria?"
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
            "{deleteProps?.name}"
          </Box>
          .<br /> Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </Box>
  );
}
