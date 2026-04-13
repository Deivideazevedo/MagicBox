import {
  HookCurrencyField,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { Meta } from "@/core/metas/types";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import { IconTarget, IconX, IconCheck } from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";

interface MetaDrawerFormProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  row: Meta | null;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<any>;
  isCreating: boolean;
  isUpdating: boolean;
}

export const MetaDrawerForm = ({
  open,
  onClose,
  isEditing,
  row,
  handleSubmit,
  control,
  isCreating,
  isUpdating,
}: MetaDrawerFormProps) => {
  const theme = useTheme();

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 450 },
          borderRadius: { xs: 0, sm: "24px 0 0 24px" },
          p: 0,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
            }}
          >
            <IconTarget size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isEditing ? "Editar Objetivo" : "Novo Objetivo"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isEditing ? "Ajuste os detalhes da sua meta" : "Defina sua próxima grande conquista"}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Identidade Visual */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
            Identidade Visual
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
            <IconColorMenuPicker
              control={control}
              iconName="icone"
              colorName="cor"
              watchIcon={watchIcon}
              watchColor={watchColor}
              fallbackIcon="IconTarget"
              fallbackColor={theme.palette.primary.main}
            />
            <Box>
              <Typography variant="body1" fontWeight={700} color="primary.main">
                {watchNome || (isEditing ? row?.nome : "Nome do Objetivo")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Personalize o ícone e a cor da sua meta
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Dados da Meta */}
        <Stack spacing={3}>
          <HookTextField
            label="Nome do Objetivo"
            name="nome"
            control={control}
            placeholder="Ex: Reserva de Emergência, iPhone 16..."
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <HookCurrencyField
              name="valorMeta"
              control={control}
              label="Valor Objetivo"
              returnAsNumber={true}
              fullWidth
            />
            <HookTextField
              name="dataAlvo"
              control={control}
              label="Data Alvo"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </Stack>

        {/* Footer Actions */}
        <Box sx={{ mt: "auto", pt: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={isCreating || isUpdating}
              startIcon={<IconCheck size={18} />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                boxShadow: theme.shadows[4],
              }}
            >
              {isEditing ? "Salvar Alterações" : "Criar Meta"}
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MetaDrawerForm;
