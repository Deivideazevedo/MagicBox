"use client";

import { Receita } from "@/core/receitas/types";
import { Box, Grid } from "@mui/material";
import { useReceitas } from "../../hooks/useReceitas";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

interface ReceitasTabProps {
  receitas: Receita[];
}

export default function ReceitasTab({
  receitas,
}: ReceitasTabProps) {
  const { formProps, listProps } = useReceitas({
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
    </Box>
  );
}
