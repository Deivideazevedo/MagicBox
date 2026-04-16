import { useState, useRef, useEffect } from "react";
import { MetasDashboard } from "./MetasDashboard";
import { Listagem } from "./Listagem";
import { Formulario } from "./Formulario";
import { useMetas } from "../../hooks/useMetas";
import { Meta } from "@/core/metas/types";
import { Box, Grid, Slide, useTheme } from "@mui/material";

export const MetasTab = () => {
  const theme = useTheme();
  const formRef = useRef<HTMLDivElement>(null);
  const [exibirFormulario, setExibirFormulario] = useState(false);

  const {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isEditing,
    control,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancelEdit,
  } = useMetas();

  const handleOpenNew = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleOpenEdit = (meta: Meta) => {
    handleEdit(meta);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  const handleAporte = (meta: Meta) => {
    handleOpenEdit(meta);
  };

  useEffect(() => {
    if (isEditing) setExibirFormulario(true);
  }, [isEditing]);

  return (
    <Box px={3}>
      <MetasDashboard metas={metas} onNew={handleOpenNew}>
        <Grid container spacing={3}>
          <Slide direction="right" in={exibirFormulario} mountOnEnter unmountOnExit>
            <Grid item xs={12} md={4}>
              <Formulario
                isEditing={isEditing}
                row={null}
                control={control}
                handleSubmit={handleSubmit}
                isCreating={isCreating}
                isUpdating={isUpdating}
                handleCancelEdit={handleFecharFormulario}
                formRef={formRef}
              />
            </Grid>
          </Slide>

          <Grid item xs={12} md={exibirFormulario ? 8 : 12}>
            <Listagem
              metas={metas}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAporte={handleAporte}
            />
          </Grid>
        </Grid>
      </MetasDashboard>
    </Box>
  );
};

export default MetasTab;
