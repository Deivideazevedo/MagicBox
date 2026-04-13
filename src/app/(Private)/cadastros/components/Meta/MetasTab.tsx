import { useState } from "react";
import { MetasDashboard } from "./MetasDashboard";
import { Listagem } from "./Listagem";
import { MetaDrawerForm } from "./MetaDrawerForm";
import { useMetas } from "../../hooks/useMetas";
import { Meta } from "@/core/metas/types";
import { Box } from "@mui/material";

export const MetasTab = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);

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
    setSelectedMeta(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (meta: Meta) => {
    handleEdit(meta);
    setSelectedMeta(meta);
    setDrawerOpen(true);
  };

  const onFormSubmit = async (e?: React.BaseSyntheticEvent) => {
    await handleSubmit(e);
    setDrawerOpen(false);
    setSelectedMeta(null);
  };

  const handleAporte = (meta: Meta) => {
    // TODO: Implementar modal de aporte rápido se necessário
    console.log("Aporte em:", meta.nome);
    handleOpenEdit(meta); // Por enquanto abre edição
  };

  return (
    <Box>
      <MetasDashboard metas={metas} onNew={handleOpenNew}>
        <Listagem
          metas={metas}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAporte={handleAporte}
        />
      </MetasDashboard>

      <MetaDrawerForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          handleCancelEdit();
        }}
        isEditing={isEditing}
        row={selectedMeta}
        handleSubmit={onFormSubmit}
        control={control}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />
    </Box>
  );
};

export default MetasTab;
