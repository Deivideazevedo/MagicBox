import fs from "fs";
import path from "path";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

/**
 * Carrega dinamicamente os arquivos de comportamento e conhecimento de docs/skills
 * e gera o System Prompt enriquecido temporalmente para o agente.
 */
export function construirSystemPrompt(): string {
  const skillsPath = path.join(process.cwd(), "docs", "skills");
  const arquivosSkills = [
    "01-comportamento.md",
    "02-ferramentas.md",
    "05-orientacoes-questionamento.md",
    "03-conhecimento-app.md"
  ];
  let relatorioSkills = "";

  try {
    for (const arquivo of arquivosSkills) {
      const filePath = path.join(skillsPath, arquivo);
      if (fs.existsSync(filePath)) {
        relatorioSkills += fs.readFileSync(filePath, "utf8") + "\n\n---\n\n";
      }
    }
  } catch (err) {
    console.error("Erro ao ler arquivos de skills/instruções:", err);
  }

  // Obter contexto temporal em tempo de execução
  const agora = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long" };
  const diaSemana = new Intl.DateTimeFormat("pt-BR", options).format(agora);
  const dataLocal = fnFormatDateInTimeZone();
  const anoAtual = agora.getFullYear();

  return `
# CONTEXTO TEMPORAL
- HOJE: ${dataLocal} (${diaSemana}).
- ANO ATUAL: ${anoAtual}.

# CONHECIMENTO DO ASSISTENTE
${relatorioSkills}
  `;
}
