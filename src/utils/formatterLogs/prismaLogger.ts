import { PrismaClient, Prisma } from "@prisma/client";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

// Configuração de largura total da caixa
const BOX_WIDTH = 120;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const keywordColors: Record<string, string> = {
  SELECT: colors.blue,
  UPDATE: colors.yellow,
  INSERT: colors.green,
  DELETE: colors.red,
  BEGIN: colors.magenta,
  COMMIT: colors.magenta,
  ROLLBACK: colors.red,
  WHERE: colors.magenta,
  FROM: colors.magenta,
  JOIN: colors.magenta,
  ORDER: colors.magenta,
  LIMIT: colors.magenta,
  OFFSET: colors.magenta,
  AND: colors.magenta,
  OR: colors.magenta,
  AS: colors.magenta,
  ON: colors.magenta,
  SET: colors.magenta,
  VALUES: colors.magenta,
  RETURNING: colors.magenta,
};

/**
 * Remove códigos ANSI para calcular o tamanho visual real
 */
const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, "");

/**
 * Quebra o texto em array de linhas
 */
const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const currentLength = stripAnsi(currentLine).length;
    const wordLength = stripAnsi(word).length;

    if (currentLength + 1 + wordLength <= maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

/**
 * Adiciona as bordas e corrige o bug do Emoji
 */
const formatLineWithBorder = (content: string, width: number): string => {
  let visualLength = stripAnsi(content).length;

  // CORREÇÃO: O emoji ⏰ ocupa 2 espaços visuais, mas length conta 1.
  // Adicionamos +1 ao tamanho visual calculado para compensar.
  if (content.includes("⏰")) {
    visualLength += 1;
  }

  // Calcula preenchimento
  const padding = Math.max(0, width - visualLength);
  const spaces = " ".repeat(padding);
  
  return `${colors.gray}│${colors.reset} ${content}${spaces} ${colors.gray}│${colors.reset}`;
};

const formatQuery = (query: string, params: string): string => {
  try {
    const parsedParams = JSON.parse(params);
    let cleanQuery = query.replace(/"public"\./g, "").replace(/"/g, "");

    if (Array.isArray(parsedParams)) {
      parsedParams.forEach((param, index) => {
        let value = param;
        if (typeof param === "string") value = `'${param}'`;
        else if (param instanceof Date) value = `'${param.toISOString()}'`;
        else if (param === null) value = "NULL";
        else if (typeof param === "boolean") value = param ? "TRUE" : "FALSE";
        
        const regex = new RegExp(`\\$${index + 1}(?![0-9])`, "g");
        cleanQuery = cleanQuery.replace(regex, `${colors.cyan}${value}${colors.reset}`);
      });
    }

    Object.keys(keywordColors).forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      cleanQuery = cleanQuery.replace(regex, (match) => {
        return `${colors.bright}${keywordColors[match.toUpperCase()]}${match.toUpperCase()}${colors.reset}`;
      });
    });

    return cleanQuery;
  } catch (e) {
    return query;
  }
};

export function prismaLogger(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production") return;

  const borderTop = "─".repeat(BOX_WIDTH - 2);
  const borderBottom = "─".repeat(BOX_WIDTH - 2);

  // @ts-ignore
  prisma.$on("query", (e: Prisma.QueryEvent) => {
    const durationMs = Math.round(e.duration);
    const timestamp = fnFormatDateInTimeZone({ format: "br-timeDate" });
    const cleanSql = formatQuery(e.query, e.params);
    const durationColor = durationMs < 100 ? colors.green : colors.red;

    const contentWidth = BOX_WIDTH - 4;

    const metaInfo = `⏰ ${colors.dim}${timestamp}${colors.reset}  Tempo: ${durationColor}${durationMs}ms${colors.reset}`;
    const metaLine = formatLineWithBorder(metaInfo, contentWidth);

    const sqlLines = wrapText(cleanSql, contentWidth);
    const formattedSqlLines = sqlLines.map(line => formatLineWithBorder(line, contentWidth)).join("\n");

    console.log(
      `${colors.gray}┌${borderTop}┐${colors.reset}\n` +
      `${metaLine}\n` +
      `${formattedSqlLines}\n` +
      `${colors.gray}└${borderBottom}┘${colors.reset}`
    );
  });
}