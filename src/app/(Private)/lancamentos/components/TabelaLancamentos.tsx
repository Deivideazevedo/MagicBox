"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  alpha,
} from "@mui/material";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCurrencyReal,
  IconNotes,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lancamento } from "@/core/lancamentos/types";
import { Despesa } from "@/core/despesas/types";
import { Categoria } from "@/core/categorias/types";
import { Swalert } from "@/utils/swalert";

interface TabelaLancamentosProps {
  lancamentos: Lancamento[];
  despesas: Despesa[];
  categorias: Categoria[];
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

interface LancamentoAgrupado {
  contaNome: string;
  despesaId: string;
  despesaNome: string;
  categoriaId: string;
  categoriaNome: string;
  data: string;
  lancamentos: Lancamento[];
  valorTotal: number;
  valorPagoTotal: number;
  observacoes: string[];
}

export default function TabelaLancamentos({
  lancamentos,
  despesas,
  categorias,
  onEdit,
  onDelete,
  isDeleting,
}: TabelaLancamentosProps) {
  const [dialogObservacoes, setDialogObservacoes] = useState<{
    open: boolean;
    dados: LancamentoAgrupado | null;
  }>({
    open: false,
    dados: null,
  });

  // Agrupar lançamentos por conta e mês
  const lancamentosAgrupados = useMemo(() => {
    const grupos: Record<string, LancamentoAgrupado> = {};

    lancamentos.forEach((lancamento) => {
      const despesa = despesas.find((d) => d.id === lancamento.despesaId);
      const categoria = categorias.find((c) => c.id === despesa?.categoriaId);
      
      if (!despesa) return;

      // Criar chave única por conta + mês/ano
      const dataObj = new Date(lancamento.data);
      const mesAno = `${dataObj.getMonth()}-${dataObj.getFullYear()}`;
      const chave = `${lancamento.categoriaId}-${mesAno}`;

      if (!grupos[chave]) {
        grupos[chave] = {
          categoriaId: String(lancamento.categoriaId),
          contaNome: despesa.nome,
          despesaId: String(despesa.id),
          despesaNome: despesa.nome,
          categoriaNome: categoria?.nome || "",
          data: lancamento.data,
          lancamentos: [],
          valorTotal: 0,
          valorPagoTotal: 0,
          observacoes: [],
        };
      }

      grupos[chave].lancamentos.push(lancamento);
      grupos[chave].valorTotal += Number(lancamento.valor);
      
      // Criar observação formatada
      const dataLanc = format(new Date(lancamento.createdAt), "dd/MM", { locale: ptBR });
      const parcelaInfo = lancamento.parcelas ? ` (${lancamento.parcelas}x)` : "";
      const obs = `${lancamento.descricao}${parcelaInfo} - R$ ${Number(lancamento.valor).toFixed(2)} (${dataLanc})`;
      grupos[chave].observacoes.push(obs);
    });

    return Object.values(grupos).sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [lancamentos, despesas, categorias]);

  const handleVisualizarObservacoes = (grupo: LancamentoAgrupado) => {
    setDialogObservacoes({ open: true, dados: grupo });
  };

  const handleCloseDialog = () => {
    setDialogObservacoes({ open: false, dados: null });
  };

  const handleEditLancamento = (lancamento: Lancamento) => {
    onEdit(lancamento);
  };

  const handleDeleteLancamento = async (lancamento: Lancamento) => {

    const result = await Swalert({
      title: "Confirmar Exclusão",
      html: `
        <p>Deseja realmente excluir este lançamento?</p>
        <br/>
        <strong>${lancamento.descricao}</strong>
        <br/>
        <small>Valor: R$ ${Number(lancamento.valor).toFixed(2)}</small>
      `,
      icon: "warning",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      onDelete(String(lancamento.id));
    }
  };

  const getDiasAteVencimento = (data: string) => {
    const hoje = new Date();
    const vencimento = new Date(data);
    const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} dias vencido`;
    if (diff === 0) return "Vence hoje";
    return `${diff} dias até ${format(vencimento, "dd 'de' MMM.", { locale: ptBR })}`;
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Data
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Categoria
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Conta
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Vlr. Previsto
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Vlr. Pago
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Ações
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lancamentosAgrupados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhum lançamento cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lancamentosAgrupados.map((grupo) => (
                <TableRow
                  key={`${grupo.categoriaId}-${grupo.data}`}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(grupo.data), "dd/MM/yyyy", { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {getDiasAteVencimento(grupo.data)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{grupo.categoriaNome}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title="Clique para ver todas as observações" 
                      placement="top"
                    >
                      <Box
                        onClick={() => handleVisualizarObservacoes(grupo)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            color: "primary.main",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {grupo.contaNome}
                        </Typography>
                        {grupo.observacoes.length > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            {grupo.observacoes.length} observação(ões)
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grupo.valorPagoTotal > 0 ? "Pago" : "Pendente"}
                      color={grupo.valorPagoTotal > 0 ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      R$ {grupo.valorTotal.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
                      color={grupo.valorPagoTotal > 0 ? "success.main" : "text.secondary"}
                    >
                      {grupo.valorPagoTotal > 0 
                        ? `R$ ${grupo.valorPagoTotal.toFixed(2)}`
                        : "-"
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Visualizar detalhes">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleVisualizarObservacoes(grupo)}
                        >
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                      {grupo.lancamentos.map((lanc) => (
                        <Box key={lanc.id} sx={{ display: "inline-flex", gap: 0.5 }}>
                          <Tooltip title="Editar lançamento">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditLancamento(lanc)}
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir lançamento">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLancamento(lanc)}
                              disabled={isDeleting}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Visualização de Observações */}
      <Dialog
        open={dialogObservacoes.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "info.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "info.main",
              }}
            >
              <IconNotes size={20} />
            </Box>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600}>
                Detalhes da Conta
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dialogObservacoes.dados?.contaNome}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <IconX size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent>
          {dialogObservacoes.dados && (
            <Stack spacing={3}>
              {/* Informações Gerais */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Categoria
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {dialogObservacoes.dados.categoriaNome}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Valor Total Previsto
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                    R$ {dialogObservacoes.dados.valorTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Valor Total Pago
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={dialogObservacoes.dados.valorPagoTotal > 0 ? "success.main" : "text.secondary"}
                    fontWeight={600}
                  >
                    {dialogObservacoes.dados.valorPagoTotal > 0 
                      ? `R$ ${dialogObservacoes.dados.valorPagoTotal.toFixed(2)}`
                      : "R$ 0,00"
                    }
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Lista de Observações */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Observações dos Lançamentos ({dialogObservacoes.dados.observacoes.length})
                </Typography>
                <List
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  {dialogObservacoes.dados.observacoes.map((obs, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: "background.paper",
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      <ListItemText
                        primary={obs}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { fontFamily: "monospace" },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Informações Adicionais */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  <strong>Total de lançamentos:</strong> {dialogObservacoes.dados.lancamentos.length}
                  <br />
                  <strong>Data de referência:</strong> {format(new Date(dialogObservacoes.dados.data), "MMMM 'de' yyyy", { locale: ptBR })}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            startIcon={<IconX size={16} />}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
