"use client";

import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { Box, Grid } from "@mui/material";
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
  const { formProps, listProps } = useDespesas({
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

        {/* Lista de Despesas */}
        <Grid item xs={12} md={8}>
          <Listagem {...listProps} />
        </Grid>
      </Grid>
    </Box>
  );
}
