// src/core/despesas/despesa.repository.ts
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { fnReadFile, fnWriteFile } from "@/utils/functions/fnFile";
import { writeFileSync } from "fs";
import { join } from "path";
import { DespesaModel } from "./model";
import { Despesa, DespesaPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/desepesas.json");

export const despesaRepository = {
  findAll(filters: Partial<Despesa>) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);

    if (Object.keys(filters).length === 0) return despesas;

    return fnApplyFilters(despesas, filters);
  },

  findById(id: string): Despesa | null {
    const despesas = fnReadFile<Despesa>(DATA_PATH);
    const index = despesas.findIndex((item) => item.id === id);

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
    fnWriteFile<Despesa>(DATA_PATH, despesas);

    return novaDespesa;
  },

  remove(id: string) {
    let despesas = fnReadFile<Despesa>(DATA_PATH);

    despesas = despesas.filter((c) => c.id !== id);

    fnWriteFile<Despesa>(DATA_PATH, despesas);
    return true;
  },

  update(id: string, payload: DespesaPayload) {
    const despesas = fnReadFile<Despesa>(DATA_PATH);
    const index = despesas.findIndex((item) => item.id === id);

    const payloadCleaned = fnCleanObject({
      dataForm: payload,
      keysToRemove: ["userId"],
    });

    const updatedDespesa: Despesa = {
      ...despesas[index],
      ...payloadCleaned,
      valorEstimado: payload.valorEstimado ?? null,
      diaVencimento: Number(payload.diaVencimento) ?? null,
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    despesas[index] = updatedDespesa;

   fnWriteFile<Despesa>(DATA_PATH, despesas);
    return updatedDespesa;
  },
};
