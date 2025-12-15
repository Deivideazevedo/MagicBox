// src/core/categorias/categoria.repository.ts
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { fnReadFile, fnWriteFile } from "@/utils/functions/fnFile";
import { fnPickFields } from "@/utils/functions/fnPickFields";
import { writeFileSync } from "fs";
import { join } from "path";
import { CategoriaModel } from "./model";
import { Categoria, CategoriaPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/categorias.json");

export const categoriaRepository = {
  findAll(filters: Partial<Categoria>) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);

    if (Object.keys(filters).length === 0) return categorias;    

    return fnApplyFilters(categorias, filters);
  },

  findById(id: string): Categoria | null {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    const index = categorias.findIndex((item) => item.id === id);

    return index === -1 ? null : categorias[index];
  },

  findByUser(userId: string) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    return categorias.filter((c) => c.userId === userId);
  },

  create(categoria: CategoriaPayload) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    const novaCategoria = new CategoriaModel(categoria);
    
    categorias.push(novaCategoria);
    fnWriteFile<Categoria>(DATA_PATH, categorias);

    return novaCategoria;
  },

  remove(id: string) {
    let categorias = fnReadFile<Categoria>(DATA_PATH);

    categorias = categorias.filter((c) => c.id !== id);

    fnWriteFile<Categoria>(DATA_PATH, categorias);
    return true;
  },

  update(id: string, object: CategoriaPayload) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    const index = categorias.findIndex((item) => item.id === id);

    const updatedCategoria = {
      ...categorias[index],
      ...fnPickFields(object, ["nome"]),
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    categorias[index] = updatedCategoria;

    fnWriteFile<Categoria>(DATA_PATH, categorias);
    return updatedCategoria;
  },
};
