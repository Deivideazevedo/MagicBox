/**
 * Configuração global do Zod para mensagens de erro em português
 *
 * ✅ Zod v4 - Usando API moderna (z.config)
 * ✅ Sem tipos depreciados
 * ✅ Auto-inicializado (importação única necessária)
 *
 * Prioridade de mensagens:
 * 1. Mensagem definida no schema (ex: .min(1, "Mensagem custom"))
 * 2. Mensagem global customizada (definida neste errorMap)
 * 3. Fallback nativo do Zod
 */

import { z } from "zod";

/**
 * Helper para obter o nome do campo de forma amigável
 */
const getFieldPrefix = (path?: PropertyKey[]): string => {
  if (!path || path.length === 0) return "";
  const many = path.length > 1 ? "s" : "";
  
  return `O${many} campo${many}: '${path.join(", ")}'`;
};

/**
 * ErrorMap customizado em português
 * Retorna string | undefined | null conforme esperado pelo Zod v4
 */
/*
    🎯 LÓGICA:
    - Se retornar undefined/null, Zod usa a mensagem padrão dele (fallback)
    - Se retornar string ou { message: string }, usa nossa mensagem customizada
    - Mensagens do schema sempre têm prioridade (Zod resolve isso internamente)
*/
const customErrorMap: z.core.$ZodErrorMap = (issue) => {
  const field = getFieldPrefix(issue.path);

  const withField = (message: string) =>
    field ? `${field} ${message}` : message;

  switch (issue.code) {
    case "invalid_type":
      if (issue.input === undefined || issue.input === null) {
        return withField("é obrigatório");
      }

      const typeMap: Record<string, string> = {
        string: "texto",
        number: "número",
        boolean: "verdadeiro/falso",
        date: "data",
        array: "lista",
        object: "objeto",
      };

      return withField(
        `deve ser do tipo ${typeMap[issue.expected] ?? issue.expected}`
      );

    case "too_small":
      if (issue.origin === "string") {
        return issue.minimum === 1
          ? withField("é obrigatório")
          : withField(`deve ter no mínimo ${issue.minimum} caracteres`);
      }

      if (issue.origin === "number" || issue.origin === "int" || issue.origin === "bigint") {
        return withField(`deve ser no mínimo ${issue.minimum}`);
      }

      if (issue.origin === "array") {
        return withField(`deve ter no mínimo ${issue.minimum} itens`);
      }

      return withField("é muito pequeno");

    case "too_big":
      if (issue.origin === "string") {
        return withField(`deve ter no máximo ${issue.maximum} caracteres`);
      }

      if (issue.origin === "number" || issue.origin === "int" || issue.origin === "bigint") {
        return withField(`deve ser no máximo ${issue.maximum}`);
      }

      if (issue.origin === "array") {
        return withField(`deve ter no máximo ${issue.maximum} itens`);
      }

      return withField("é muito grande");

    case "invalid_format":
      if (issue.format === "email") return withField("deve ser um e-mail válido");
      if (issue.format === "url") return withField("deve ser uma URL válida");
      if (issue.format === "uuid") return withField("deve ser um UUID válido");
      return withField("está em formato inválido");

    case "not_multiple_of":
      return withField(`deve ser múltiplo de ${issue.divisor}`);

    case "unrecognized_keys":
      return `Campos não permitidos: ${issue.keys.join(", ")}`;

    case "invalid_value":
      return withField(`é inválido. Opções válidas: ${issue.values.join(", ")}`);

    case "invalid_union":
      return field
        ? `${field} não corresponde a nenhuma das opções válidas`
        : "Nenhuma das opções válidas foi fornecida";

    case "custom":
    default:
      return undefined;
  }
};


/**
 * 🎯 AUTO-INICIALIZAÇÃO
 * Configura o errorMap global assim que o módulo é importado
 * Não precisa chamar função explicitamente
 */
z.config({
  customError: customErrorMap,
});
