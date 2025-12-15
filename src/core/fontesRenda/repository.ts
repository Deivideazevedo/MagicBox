// src/core/fonteRendas/fonteRenda.repository.ts
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { fnReadFile, fnWriteFile } from "@/utils/functions/fnFile";
import { writeFileSync } from "fs";
import { join } from "path";
import { FonteRendaModel } from "./model";
import { FonteRenda, FonteRendaPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/fonteRendas.json");

export const fonteRendaRepository = {
  findAll(filters: Partial<FonteRenda>) {
    const fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);

    if (Object.keys(filters).length === 0) return fonteRendas;    

    return fnApplyFilters(fonteRendas, filters);
  },

  findById(id: string): FonteRenda | null {
    const fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);
    const index = fonteRendas.findIndex((item) => item.id === id);

    return index === -1 ? null : fonteRendas[index];
  },

  findByUser(userId: string) {
    const fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);
    return fonteRendas.filter((c) => c.userId === userId);
  },

  create(fonteRenda: FonteRendaPayload) {
    const fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);
    const novaFonteRenda = new FonteRendaModel(fonteRenda);
    
    fonteRendas.push(novaFonteRenda);
    fnWriteFile<FonteRenda>(DATA_PATH, fonteRendas);

    return novaFonteRenda;
  },

  remove(id: string) {
    let fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);

    fonteRendas = fonteRendas.filter((c) => c.id !== id);

    fnWriteFile<FonteRenda>(DATA_PATH, fonteRendas);
    return true;
  },

  update(id: string, payload: FonteRendaPayload) {
    const fonteRendas = fnReadFile<FonteRenda>(DATA_PATH);
    const index = fonteRendas.findIndex((item) => item.id === id);

    const payloadCleaned = fnCleanObject({
      dataForm: payload,
      keysToRemove: ["userId"],
    });


    const updatedFonteRenda = {
      ...fonteRendas[index],
      ...payloadCleaned,
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    fonteRendas[index] = updatedFonteRenda;

    fnWriteFile<FonteRenda>(DATA_PATH, fonteRendas);
    return updatedFonteRenda;
  },
};
