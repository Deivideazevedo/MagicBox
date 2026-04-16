import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDecimalField,
  HookSelect,
  HookTextField,
  IconColorMenuPicker,
} from "@/app/components/forms/hooksForm";
import { Despesa } from "@/core/despesas/types";
import { DespesaFormData } from "../../hooks/useDespesas";
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
import { Categoria } from "@/core/categorias/types";
import {
  IconCalendar,
  IconRepeat,
  IconPlus,
  IconX,
  IconCurrencyDollar,
  IconCategory,
  IconCreditCard,
} from "@tabler/icons-react";
import { Control, useForm, UseFormSetFocus, useFormState, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  isCollapsed: boolean;
  row: Despesa | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<DespesaFormData>;
  isCreating: boolean;
  isUpdating: boolean;
  categorias: Categoria[];
  setFocus: UseFormSetFocus<Categoria>;
}

export const Formulario = (formProps: FormProps) => {
  const theme = useTheme();
  const {
    isEditing,
    row,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    categorias,
    handleCancelEdit,
    setFocus,
  } = formProps;

  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.error.light, 0.05),
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
            fallbackIcon="IconShoppingCart"
            fallbackColor={theme.palette.error.main}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              {isEditing ? "Editando Despesa:" : "Nova Despesa"}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={isEditing ? 600 : 400}
              color={isEditing ? "error.main" : "text.secondary"}
            >
              {watchNome || (isEditing ? row?.nome : "Adicione uma nova despesa")}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <HookSelect
                name="categoriaId"
                color="error"
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
                onChange={(value) => {
                  value && setTimeout(() => setFocus("nome"), 0);
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <HookTextField
                label="Nome da Despesa"
                name="nome"
                color="error"
                control={control}
                placeholder="Ex: Conta de Luz, Gasolina..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCreditCard size={20} />
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
                        color="error"
                        control={control}
                        label="Valor Estimado "
                        returnAsNumber={true}
                        placeholder="(opcional)"
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
                        name="diaVencimento"
                        color="error"
                        control={control}
                        label="Dia do Vencimento"
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
                color="error"
                variant="checkbox"
                iconActive={<IconRepeat size={12} color="white" strokeWidth={3} />}
                titleActive="Repetir mensalmente"
                titleInactive="Repetir mensalmente"
                descriptionActive="Despesa recorrente todo mês"
                descriptionInactive="Ativar para despesas mensais"
              />
            </Grid>

            {/* Status ativada manualmente na UI */}
            <Grid item xs={12} mt={-1}>
              <CustomToggle
                control={control}
                name="status"
                activeValue="A"
                inactiveValue="I"
                color="success"
                variant="switch"
                titleActive="Despesa Ativa"
                titleInactive="Despesa Inativa"
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
                  color="error"
                  startIcon={<IconPlus size={16} />}
                >
                  {isEditing ? "Atualizar" : "Adicionar"}
                </LoadingButton>

                {isEditing && (
                  <Button variant="outlined" fullWidth onClick={handleCancelEdit} startIcon={<IconX size={16} />}>
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
