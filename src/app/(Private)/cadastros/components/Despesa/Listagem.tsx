import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
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
  Typography,
} from "@mui/material";
import {
  IconCreditCard,
  IconEdit,
  IconRepeat,
  IconTrash,
} from "@tabler/icons-react";

interface ListProps {
  despesas: Despesa[];
  handleDelete: (despesa: Despesa) => void;
  handleEdit: (despesa: Despesa) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { despesas, handleDelete, handleEdit } = formProps;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
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
                Despesas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {despesas.length} despesa
                {despesas.length !== 1 ? "s" : ""} cadastrada
                {despesas.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Chip
              label={`${despesas.length} despesas`}
              color="error"
              variant="outlined"
            />
          </Stack>
        </Box>

        {despesas.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <IconCreditCard
              size={64}
              style={{ opacity: 0.3, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              Nenhuma despesa cadastrada
            </Typography>
            <Typography variant="body2">
              Comece adicionando suas primeiras despesas
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {despesas.map((despesa: Despesa, index: number) => {
              return (
                <Box key={despesa.id}>
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
                        backgroundColor: despesa.status
                          ? "error.light"
                          : "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: despesa.status ? "error.main" : "grey.600",
                        mr: 2,
                      }}
                    >
                      {despesa.mensalmente ? (
                        <IconRepeat size={20} />
                      ) : (
                        <IconCreditCard size={20} />
                      )}
                    </Box>

                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1" fontWeight={500}>
                            {despesa.nome}
                          </Typography>
                          {despesa.mensalmente && (
                            <Chip
                              label="Mensal"
                              color="error"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={despesa.status ? "Ativa" : "Inativa"}
                            color={despesa.status ? "success" : "default"}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Categoria: {despesa.categoria?.nome || "N/A"}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            {despesa.mensalmente && despesa.valorEstimado && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Valor:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(despesa.valorEstimado)}
                              </Typography>
                            )}
                            {despesa.mensalmente && despesa.diaVencimento && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Vence dia {despesa.diaVencimento}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(despesa)}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          }}
                        >
                          <IconEdit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(despesa)}
                          sx={{
                            color: "error.main",
                            "&:hover": { backgroundColor: "error.light" },
                          }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < despesas.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
