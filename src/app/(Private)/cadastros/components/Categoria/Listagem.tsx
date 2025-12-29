import { Categoria } from "@/core/categorias/types";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconCategory, IconEdit, IconTrash } from "@tabler/icons-react";

interface ListProps {
  categorias: Categoria[];
  handleOpenDialog: (categoria: Categoria) => void;
  handleEdit: (categoria: Categoria) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { categorias, handleOpenDialog, handleEdit } = formProps;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        // backgroundColor: (theme) => alpha(theme.palette.error.main, 0.04),
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Categorias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listagem de categorias
              </Typography>
            </Box>
            <Chip
              label={`${categorias.length} categorias`}
              color="primary"
              variant="outlined"
              size="medium"
            />
          </Stack>
        </Box>

        {categorias.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <IconCategory
              size={64}
              style={{ opacity: 0.3, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              Nenhuma categoria cadastrada
            </Typography>
            <Typography variant="body2">
              Comece adicionando suas primeiras categorias
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {categorias.map((categoria: any, index: number) => (
              <Box key={categoria.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                      mr: 2,
                    }}
                  >
                    <IconCategory size={20} />
                  </Box>

                  <ListItemText
                    primary={categoria.nome}
                    secondary={`Criada em ${new Date(
                      categoria.createdAt
                    ).toLocaleDateString("pt-BR")}`}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  />

                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Editar Categoria" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(categoria)}
                          color="primary"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Excluir Categoria" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(categoria)}
                          color="error"
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < categorias.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
