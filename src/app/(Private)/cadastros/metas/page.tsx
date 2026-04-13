"use client";

import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import { Meta } from "@/core/metas/types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  alpha,
  Stack,
  Collapse,
} from "@mui/material";
import {
  IconTarget,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useState, useRef } from "react";
import TransactionModal from "../components/Common/TransactionModal";
import { Formulario } from "../components/Meta/Formulario";
import { Listagem } from "../components/Meta/Listagem";
import { useMetas } from "../hooks/useMetas";

export default function MetasPage() {
  const theme = useTheme();
  const formRef = useRef<HTMLDivElement>(null);
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

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aporteState, setAporteState] = useState<{
    open: boolean;
    target: Meta | null;
  }>({
    open: false,
    target: null,
  });

  const BREADCRUMBS = [
    { title: "Dashboard", to: "/" },
    { title: "Metas", to: "/cadastros/metas" },
  ];

  const handleOpenAporte = (meta: Meta) => {
    setAporteState({ open: true, target: meta });
  };

  return (
    <PageContainer title="Metas" description="Gerencie seus objetivos financeiros">
      <Breadcrumb title="Metas" items={BREADCRUMBS} />

      <Box mb={3} display="flex" justifyContent="flex-end">
        <Button
          variant="text"
          color="primary"
          startIcon={isCollapsed ? <IconChevronDown /> : <IconChevronUp />}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "Mostrar Formulário" : "Recolher Formulário"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Formulário */}
        <Grid item xs={12} md={4}>
          <Collapse in={!isCollapsed}>
            <Formulario
              isEditing={isEditing}
              isCollapsed={isCollapsed}
              row={null} // O hook gerencia o estado do formulário interno
              control={control}
              handleSubmit={handleSubmit}
              isCreating={isCreating}
              isUpdating={isUpdating}
              handleCancelEdit={handleCancelEdit}
              formRef={formRef}
            />
          </Collapse>
        </Grid>

        {/* Listagem */}
        <Grid item xs={12} md={isCollapsed ? 12 : 8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                >
                  <IconTarget size={24} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Meus Objetivos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acompanhe o progresso das suas metas financeiras
                  </Typography>
                </Box>
              </Stack>

              <Listagem
                metas={metas}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete as any}
                onAporte={handleOpenAporte}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Aporte */}
      {aporteState.target ? (
        <TransactionModal
          open={aporteState.open}
          onClose={() => setAporteState({ ...aporteState, open: false })}
          type="meta"
          targetId={aporteState.target.id}
          targetName={aporteState.target.nome}
          categoriaId={1} // ID Padrão para Metas
        />
      ) : (
        <></>
      )}
    </PageContainer>
  );
}
