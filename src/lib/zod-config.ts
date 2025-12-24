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
const getFieldName = (path: PropertyKey[] | undefined): string => {
  if (!path || path.length === 0) return "";
  return `"${path.join(", ")}"`;
};

/**
 * ErrorMap customizado em português
 * Retorna string | undefined | null conforme esperado pelo Zod v4
 */
const customErrorMap: z.core.$ZodErrorMap = (issue) => {
  /*
    🎯 LÓGICA:
    - Se retornar undefined/null, Zod usa a mensagem padrão dele (fallback)
    - Se retornar string ou { message: string }, usa nossa mensagem customizada
    - Mensagens do schema sempre têm prioridade (Zod resolve isso internamente)
  */

  const fieldName = getFieldName(issue.path);
  const fieldPrefix = fieldName ? `O campo ${fieldName} ` : "";

  switch (issue.code) {
    // 1️⃣ TIPOS INVÁLIDOS
    case "invalid_type":
      // Campo obrigatório (quando o campo não foi enviado ou é null)
      // issue.input contém o valor REAL que foi recebido
      // Se não foi enviado, issue.input será undefined
      if (issue.input === undefined || issue.input === null) {
        return fieldName ? `O campo ${fieldName} é obrigatório` : "Campo obrigatório";
      }
      // Tipo incorreto (campo foi enviado mas com tipo errado)
      // Ex: esperava string mas recebeu número
      const typeMap: Record<string, string> = {
        string: "texto",
        number: "número",
        boolean: "verdadeiro/falso",
        date: "data",
        array: "lista",
        object: "objeto",
      };
      const expectedType = typeMap[issue.expected] || issue.expected;
      return `${fieldPrefix}deve ser do tipo ${expectedType}`;

    // 2️⃣ VALOR MUITO PEQUENO
    case "too_small":
      if (issue.origin === "string") {
        return (issue.minimum as number) === 1
          ? fieldName ? `O campo ${fieldName} é obrigatório` : "Campo obrigatório"
          : `${fieldPrefix}deve ter no mínimo ${issue.minimum} caracteres`;
      }
      if (issue.origin === "number" || issue.origin === "int" || issue.origin === "bigint") {
        return `${fieldPrefix}deve ser no mínimo ${issue.minimum}`;
      }
      if (issue.origin === "array") {
        return `${fieldPrefix}deve ter no mínimo ${issue.minimum} itens`;
      }
      return `${fieldPrefix}é muito pequeno`;

    // 3️⃣ VALOR MUITO GRANDE
    case "too_big":
      if (issue.origin === "string") {
        return `${fieldPrefix}deve ter no máximo ${issue.maximum} caracteres`;
      }
      if (issue.origin === "number" || issue.origin === "int" || issue.origin === "bigint") {
        return `${fieldPrefix}deve ser no máximo ${issue.maximum}`;
      }
      if (issue.origin === "array") {
        return `${fieldPrefix}deve ter no máximo ${issue.maximum} itens`;
      }
      return `${fieldPrefix}é muito grande`;

    // 4️⃣ FORMATO INVÁLIDO (email, url, uuid, regex, etc)
    case "invalid_format":
      if (issue.format === "email") return `${fieldPrefix}deve ser um e-mail válido`;
      if (issue.format === "url") return `${fieldPrefix}deve ser uma URL válida`;
      if (issue.format === "uuid") return `${fieldPrefix}deve ser um UUID válido`;
      if (issue.format === "regex") return `${fieldPrefix}está em formato inválido`;
      return `${fieldPrefix}está em formato inválido`;

    // 5️⃣ NÃO É MÚLTIPLO DE
    case "not_multiple_of":
      return `${fieldPrefix}deve ser múltiplo de ${issue.divisor}`;

    // 6️⃣ CAMPOS EXTRAS (strict mode)
    case "unrecognized_keys":
      const keys = issue.keys.join(", ");
      return `Campos não permitidos: ${keys}`;

    // 7️⃣ VALOR INVÁLIDO (enums, literals)
    case "invalid_value":
      return `${fieldPrefix}inválido. Opções válidas: ${issue.values.join(", ")}`;

    // 8️⃣ UNIÃO INVÁLIDA
    case "invalid_union":
      return fieldName 
        ? `O campo ${fieldName} não corresponde a nenhuma das opções válidas`
        : "Nenhuma das opções válidas foi fornecida";

    // 9️⃣ CUSTOM (usa mensagem definida ou fallback)
    case "custom":
      return undefined; // Deixa o Zod usar a mensagem customizada do schema

    // 🔟 FALLBACK
    // Para outros casos não tratados, retorna undefined para usar mensagem padrão do Zod
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
