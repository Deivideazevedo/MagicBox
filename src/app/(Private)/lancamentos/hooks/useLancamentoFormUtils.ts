import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import { LancamentoFormData } from "./useLancamentoForm";

export type TipoLancamentoOrigem = "despesa" | "receita" | "meta";
export type TipoLancamento = "pagamento" | "agendamento" | "investimento" | "retirada";

/**
 * Mapeia um lançamento vindo da API para o formato esperado pelo formulário (RHF)
 */
export function mapearDadosParaFormulario(lancamento: LancamentoResposta) {
  const despesaId = lancamento?.despesaId ?? (lancamento as any).despesa_id;
  const receitaId = lancamento?.receitaId ?? (lancamento as any).receita_id;
  const metaId = lancamento?.metaId ?? (lancamento as any).meta_id;

  let origem: TipoLancamentoOrigem = "despesa";
  if (receitaId) origem = "receita";
  if (metaId) origem = "meta";

  // Mapeia o tipo visual para Metas
  let tipoForm = lancamento.tipo as any;
  const valorReal = Number(lancamento.valor);
  if (origem === "meta") {
    tipoForm = valorReal < 0 ? "retirada" : "investimento";
  }

  // Formata a data para YYYY-MM-DD
  const dataLancamento =
    typeof lancamento.data === "string"
      ? lancamento.data.split("T")[0]
      : new Date(lancamento.data).toISOString().split("T")[0];

  return {
    origem,
    dados: {
      id: lancamento.id,
      itemId: Number(despesaId || receitaId || metaId),
      tipo: tipoForm,
      valor: Math.abs(valorReal),
      data: dataLancamento,
      observacao: lancamento.observacao || "",
      parcelar: false,
      parcelas: null,
    },
  };
}

/**
 * Mapeia os dados do formulário para o payload de criação/atualização da API
 */
export function mapearFormularioParaPayload(
  payload: LancamentoFormData,
  userId: number,
  origem: TipoLancamentoOrigem,
): LancamentoPayload {
  const isMeta = origem === "meta";
  
  // Inverte o sinal se for retirada de meta
  const valorFinal = isMeta
    ? payload.tipo === "retirada" ? -Math.abs(payload.valor) : Math.abs(payload.valor)
    : payload.valor;

  return {
    userId,
    despesaId: origem === "despesa" ? payload.itemId : null,
    receitaId: origem === "receita" ? payload.itemId : null,
    metaId: isMeta ? payload.itemId : null,
    tipo: (isMeta ? "pagamento" : payload.tipo) as any,
    valor: valorFinal,
    data: payload.data,
    observacao: payload.observacao || undefined,
    parcelas: payload.parcelar && payload.parcelas ? payload.parcelas : null,
  };
}

/**
 * Retorna as labels amigáveis para mensagens de sucesso (Toast)
 */
export function obterLabelSucesso(origem: TipoLancamentoOrigem, tipo: string) {
  const labels: Record<string, string> = {
    despesa: "Despesa",
    receita: "Receita",
    meta_investimento: "Investimento",
    meta_retirada: "Retirada",
  };

  const key = origem === "meta" ? `meta_${tipo}` : origem;
  return labels[key] || "Lançamento";
}
