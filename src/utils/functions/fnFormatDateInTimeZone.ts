import { TIME_ZONE } from "@/constants/globals";
import { formatInTimeZone } from "date-fns-tz";


const FORMAT_MAP = {
  iso: "yyyy-MM-dd'T'HH:mm:ssXXX",
  datetime: "yyyy-MM-dd'T'HH:mm",
  date: "yyyy-MM-dd",
  time: "HH:mm",
  "br-datetime": "dd/MM/yyyy HH:mm",
  "br-timeDate": "HH:mm dd/MM/yyyy",
  "br-date": "dd/MM/yyyy",
} as const;

type DateFormat = keyof typeof FORMAT_MAP;

type FormatUTCDateProps = {
  date?: Date | string;
  format?: DateFormat;
  timeZone?: string;
};

/**
 * Formata uma data aplicando timezone informado.
 *
 * - Aceita `Date` ou `string` ISO 8601.
 * - Usa a data/hora atual caso nenhuma data seja informada.
 * - Retorna string vazia se a data for inválida.
 *

 * @param params.date 
 * Data a ser formatada: `Date` | `string` ISO 8601.
 * @default new Date()
 *
 * @param params.format
 * Formato de saída da data.
 * Valores suportados:
 * - `"iso"` → `yyyy-MM-dd'T'HH:mm:ssXXX`
 * - `"datetime"` → `yyyy-MM-dd'T'HH:mm`
 * - `"date"` → `yyyy-MM-dd`
 * - `"time"` → `HH:mm`
 * - `"br-datetime"` → `dd/MM/yyyy HH:mm`
 * - `"br-timeDate"` → `HH:mm dd/MM/yyyy`
 * - `"br-date"` → `dd/MM/yyyy`
 * @default "br-datetime"
 *
 * @param params.timeZone
 * Timezone (padrão IANA)
 * (ex: `"America/Bahia"`, `"UTC"`).
 * @default TIME_ZONE
 *
 * @returns String formatada ou vazia caso a data seja inválida.
 *
 * @example
 * fnFormatDateInTimeZone({
 *   date: "2025-12-07T23:34:55.658Z",
 *   format: "br-datetime",
 *   timeZone: "America/Sao_Paulo",
 * });
 * // "07/12/2025 20:34"
 */
export function fnFormatDateInTimeZone(
  params: FormatUTCDateProps = {}
): string {
  // Propriedades do objeto com valores padrão
  const {
    date = new Date(),
    format = "br-timeDate",
    timeZone = TIME_ZONE,
  } = params;

  // Garantir que a data é um objeto Date
  const safeDate = typeof date === "string" ? new Date(date) : date;

  // Se a data for inválida, retornar string vazia
  if (isNaN(safeDate.getTime())) return "";

  // Formatar a data na timezone desejada
  return formatInTimeZone(safeDate, timeZone, FORMAT_MAP[format]);
}
