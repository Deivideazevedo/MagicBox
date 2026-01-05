import { FonteRenda } from "@/core/fontesRenda/types";
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
import { IconRepeat } from "@tabler/icons-react";
import {
  IconEdit,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";

interface ListProps {
  fontesRenda: FonteRenda[];
  handleOpenDialog: (fonteRenda: FonteRenda) => void;
  handleEdit: (fonteRenda: FonteRenda) => void;
}

export const Listagem = (formProps: ListProps) => {
  const { fontesRenda, handleOpenDialog, handleEdit } = formProps;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
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
                Fontes de Renda
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fontesRenda.length} fonte
                {fontesRenda.length !== 1 ? "s" : ""} cadastrada
                {fontesRenda.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Chip
              label={`${fontesRenda.length} fontes`}
              color="success"
              variant="outlined"
            />
          </Stack>
        </Box>

        {fontesRenda.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <IconWallet
              size={64}
              style={{ opacity: 0.3, marginBottom: 16 }}
            />
            <Typography variant="h6" gutterBottom>
              Nenhuma fonte de renda cadastrada
            </Typography>
            <Typography variant="body2">
              Comece adicionando suas primeiras fontes de renda
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {fontesRenda.map((fonte: FonteRenda, index: number) => {
              return (
                <Box key={fonte.id}>
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
                        backgroundColor: fonte.status
                          ? "success.light"
                          : "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: fonte.status ? "success.main" : "grey.600",
                        mr: 2,
                      }}
                    >
                      {fonte.mensalmente ? (
                        <IconRepeat size={20} />
                      ) : (
                        <IconWallet size={20} />
                      )}
                      
                    </Box>

                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          component="div"
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {fonte.nome}
                          </Typography>
                          {fonte.mensalmente && (
                            <Chip
                              label="Mensal"
                              color="success"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={fonte.status ? "Ativa" : "Inativa"}
                            color={fonte.status ? "success" : "default"}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0}>
                          <Typography variant="caption" color="text.secondary">
                            Categoria: {fonte.categoria?.nome || "N/A"}
                          </Typography>
                          <Stack direction="row" spacing={2} >
                            {fonte.valorEstimado && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Valor:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(Number(fonte.valorEstimado))}
                              </Typography>
                            )}
                            {fonte.diaRecebimento && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Recebe dia {fonte.diaRecebimento}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(fonte)}
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
                          onClick={() => handleOpenDialog(fonte)}
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
                  {index < fontesRenda.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
