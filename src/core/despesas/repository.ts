// src/core/despesas/despesa.repository.ts
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { fnReadFile } from "@/utils/functions/fnReadFile";
import { writeFileSync } from "fs";
import { join } from "path";
import { DespesaModel } from "./model";
import { Despesa, DespesaPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/desepesas.json");

function writeFile(data: Despesa[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export const despesaRepository = {
  findAll(filters: Partial<Despesa>) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);

    if (Object.keys(filters).length === 0) return despesas;

    return fnApplyFilters(despesas, filters);
  },

  findById(despesaId: string): Despesa | null {
    const despesas = fnReadFile<Despesa>(DATA_PATH);
    const index = despesas.findIndex((item) => item.id === despesaId);

    return index === -1 ? null : despesas[index];
  },

  findByUser(userId: string) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);
    return despesas.filter((c) => c.userId === userId);
  },

  create(payload: DespesaPayload) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);

    const novaDespesa = new DespesaModel(payload);

    despesas.push(novaDespesa);
    writeFile(despesas);

    return novaDespesa;
  },

  remove(despesaId: string) {
    let despesas = fnReadFile<Despesa>(DATA_PATH);

    despesas = despesas.filter((c) => c.id !== despesaId);

    writeFile(despesas);
    return true;
  },

  update(despesaId: string, payload: DespesaPayload) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);
    const index = despesas.findIndex((item) => item.id === despesaId);

    const payloadCleaned = fnCleanObject({
      dataForm: payload,
    });

    const updatedDespesa = {
      ...despesas[index],
      ...payloadCleaned,
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    despesas[index] = updatedDespesa;

    writeFile(despesas);
    return updatedDespesa;
  },
};
