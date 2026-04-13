import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDecimalField,
  HookSelect,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { Categoria } from "@/core/categorias/types";
import { Receita } from "@/core/receitas/types";
import { ReceitaFormData } from "../../hooks/useReceitas";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCalendar,
  IconCategory,
  IconPlus,
  IconRepeat,
  IconX,
  IconCurrencyDollar,
  IconWallet,
} from "@tabler/icons-react";
import { Control, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  row: Receita | null;
  isCollapsed: boolean;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<ReceitaFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  categorias: Categoria[];
}

export const Formulario = (formProps: FormProps) => {
  const theme = useTheme();
  const {
    isEditing,
    categorias,
    row,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    handleCancelEdit,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });
  const watchTipo = useWatch({ control, name: "tipo" });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.success.light, 0.05),
      }}
    >
      <CardContent sx={{ px: 1, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconColorMenuPicker
            control={control}
            iconName="icone"
            colorName="cor"
            watchIcon={watchIcon}
            watchColor={watchColor}
            fallbackIcon="IconWallet"
            fallbackColor={theme.palette.success.main}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              {isEditing ? `Editando Receita:` : "Nova Receita"}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={isEditing ? 600 : 400}
              color={isEditing ? "success.main" : "text.secondary"}
            >
              {watchNome || (isEditing ? row?.nome : "Adicione uma nova receita")}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Categoria */}
            <Grid item xs={12}>
              <HookSelect
                name="categoriaId"
                color="success"
                control={control}
                options={categorias}
                label="Categoria"
                placeholder="Selecione"
                displayEmpty
                getValue={(obj) => obj.id}
                getLabel={(obj) => obj.nome}
                startAdornment={
                  <InputAdornment position="start">
                    <IconCategory size={20} />
                  </InputAdornment>
                }
                sx={{
                  "& .MuiOutlinedInput-input": {
                    paddingLeft: "0px",
                  },
                }}
              />
            </Grid>

            {/* Nome da Receita */}
            <Grid item xs={12}>
              <HookTextField
                label="Nome da Receita"
                name="nome"
                color="success"
                control={control}
                placeholder="Ex: Salário, Freelance, Investimentos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconWallet size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-input": { paddingLeft: "0px" },
                }}
              />
            </Grid>



            {/* Campos condicionais - aparecem quando tem nome */}
            <Grid item xs={12} sx={{ pt: "0px !important" }}>
              <Collapse in={!!watchNome || isEditing} timeout={400}>
                <Box sx={{ pt: 2.5 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <HookCurrencyField
                        name="valorEstimado"
                        color="success"
                        control={control}
                        label="Valor Estimado"
                        returnAsNumber={true}
                        placeholder="0,00"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCurrencyDollar size={20} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-input": { paddingLeft: 0 },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <HookDecimalField
                        name="diaRecebimento"
                        color="success"
                        control={control}
                        label="Dia do Recebimento"
                        returnAsNumber={true}
                        placeholder="Ex: 5"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCalendar size={20} />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ min: "1", max: "31", maxLength: 2 }}
                        formatOptions={{
                          maximumFractionDigits: 0,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-input": { paddingLeft: 0 },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>

            {/* Repetir Mensalmente (Label da UI vinculada ao Tipo) - Agora sempre visível acima do status */}
            <Grid item xs={12}>
              <CustomToggle
                control={control}
                name="tipo"
                activeValue="FIXA"
                inactiveValue="VARIAVEL"
                color="success"
                variant="checkbox"
                iconActive={<IconRepeat size={12} color="white" strokeWidth={3} />}
                titleActive="Repetir mensalmente"
                titleInactive="Repetir mensalmente"
                descriptionActive="Projeção recorrente todo mês"
                descriptionInactive="Ativar para receitas mensais"
              />
            </Grid>

            {/* Toggle Status */}
            <Grid item xs={12} mt={-1}>
              <CustomToggle
                control={control}
                name="status"
                activeValue="A"
                inactiveValue="I"
                color="success"
                variant="switch"
                titleActive="Receita Ativa"
                titleInactive="Receita Inativa"
                descriptionActive="Disponível para lançamentos"
                descriptionInactive="Não será exibida"
              />
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12} sx={{ pt: 2 }}>
              <Stack spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating}
                  color="success"
                  startIcon={<IconPlus size={16} />}
                >
                  {isEditing ? "Atualizar" : "Adicionar"}
                </LoadingButton>

                {isEditing && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancelEdit}
                    startIcon={<IconX size={16} />}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Formulario;
