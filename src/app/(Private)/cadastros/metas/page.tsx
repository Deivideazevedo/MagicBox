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
  IconPlus,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import TransactionModal from "../components/Common/TransactionModal";
import { Formulario } from "../components/Meta/Formulario";
import { Listagem } from "../components/Meta/Listagem";
import { MetasDashboard } from "../components/Meta/MetasDashboard";
import { useMetas } from "../hooks/useMetas";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";

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

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [exibirFormulario, setExibirFormulario] = useState(false);
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

  const handleNovaMeta = () => {
    handleCancelEdit();
    setExibirFormulario(true);
  };

  const handleEditarMeta = (meta: Meta) => {
    handleEdit(meta);
    setExibirFormulario(true);
  };

  const handleFecharFormulario = () => {
    handleCancelEdit();
    setExibirFormulario(false);
  };

  // Se entrar em modo de edição por fora (se possível), garantir que o form apareça
  useEffect(() => {
    if (isEditing) setExibirFormulario(true);
  }, [isEditing]);

  return (
    <PageContainer title="Metas" description="Gerencie seus objetivos financeiros">
      <Breadcrumb title="Metas" items={BREADCRUMBS} />

      {/* Dashboard de Totalizadores */}
      <Box mb={4}>
        <MetasDashboard metas={metas} onNew={handleNovaMeta}>
          <Grid container spacing={3}>
            {/* Formulário lateral deslizante */}
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

            {/* Listagem (Expandida ou Lado a Lado) */}
            <Grid item xs={12} md={exibirFormulario ? 8 : 12}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 4, 
                  border: "1px solid", 
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  minHeight: "400px"
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Listagem
                    metas={metas}
                    isLoading={isLoading}
                    onEdit={handleEditarMeta}
                    onDelete={handleDelete as any}
                    onAporte={handleOpenAporte}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MetasDashboard>
      </Box>

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
