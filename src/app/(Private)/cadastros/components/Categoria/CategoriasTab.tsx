import { Categoria } from "@/core/categorias/types";
import {
   Box,
   Grid
 } from "@mui/material";
import { useRef } from "react";
import { useCategorias } from "../../hooks/useCategorias";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

interface CategoriasTabProps {
  categorias: Categoria[];
}

export default function CategoriasTab({ categorias }: CategoriasTabProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const { formProps, listProps } =
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
    </Box>
  );
}
