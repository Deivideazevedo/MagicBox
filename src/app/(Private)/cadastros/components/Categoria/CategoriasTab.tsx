import { useRef } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconCategory,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { HookTextField } from "@/app/components/forms/hooksForm";
import { LoadingButton } from "@mui/lab";
import { Categoria, CategoriaForm } from "@/core/categorias/types";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { IconX } from "@tabler/icons-react";
import { useCategorias } from "../../hooks/useCategorias";
import { Formulario } from "./Formulario";
import { Listagem } from "./Listagem";

interface CategoriasTabProps {
  categorias: Categoria[];
}

export default function CategoriasTab({ categorias }: CategoriasTabProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const { handleEdit, formProps, listProps, deleteProps } =
    useCategorias({ categorias });

  // const scrollToForm = () => {
  //   if (formRef.current) {
  //     const elementPosition = formRef.current.getBoundingClientRect().top;
  //     const offsetPosition = elementPosition + window.pageYOffset - 200;

  //     window.scrollTo({
  //       top: offsetPosition,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // const handleEditWithScroll = (categoria: Categoria) => {
  //   handleEdit(categoria, scrollToForm);
  // };

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

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        {...deleteProps}
        title="Excluir Categoria?"
        icon={IconTrash}
        color="error"
      >
        <Typography variant="body1" color="text.secondary">
          Você está prestes a remover{" "}
          <Box
            component="span"
            fontWeight="bold"
            fontSize={15}
            color="text.primary"
          >
            "{deleteProps.open?.nome}"
          </Box>
          .<br /> Essa ação não poderá ser desfeita.
        </Typography>
      </DeleteConfirmationDialog>
    </Box>
  );
}
