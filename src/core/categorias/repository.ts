// src/core/categorias/categoria.repository.ts
import { fnReadFile } from "@/utils/functions/fnReadFile";
import { writeFileSync } from "fs";
import { join } from "path";
import { Categoria } from "./model";

const DATA_PATH = join(process.cwd(), "src/data/categorias.json");


function writeFile(data: Categoria[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export const categoriaRepository = {
  findByUser(userId: string) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    return categorias.filter(c => c.userId === userId);
  },

  create(categoria: Categoria) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    categorias.push(categoria);
    writeFile(categorias);
    return categoria;
  }
};
