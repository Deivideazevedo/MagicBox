// src/core/categorias/categoria.repository.ts
import { fnReadFile } from "@/utils/functions/fnReadFile";
import { writeFileSync } from "fs";
import { join } from "path";
import { NotFoundError } from "@/lib/errors";
import { fnOmitFields } from "@/utils/functions/fnOmitFields";
import { fnPickFields } from "@/utils/functions/fnPickFields";
import { fnApplyFilters } from "@/utils/functions/fnApplyFilters";
import { Categoria, CategoriaPayload } from "./types";

const DATA_PATH = join(process.cwd(), "src/data/categorias.json");

function writeFile(data: Categoria[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export const categoriaRepository = {
  findAll(filters: Partial<Categoria>) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);

    if (Object.keys(filters).length === 0) return categorias;    

    return fnApplyFilters(categorias, filters);
  },

  findById(categoriaId: string): Categoria | null {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    const index = categorias.findIndex((item) => item.id === categoriaId);

    return index === -1 ? null : categorias[index];
  },

  findByUser(userId: string) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    return categorias.filter((c) => c.userId === userId);
  },

  create(categoria: Categoria) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    categorias.push(categoria);
    writeFile(categorias);

    return categoria;
  },

  remove(categoriaId: string) {
    let categorias = fnReadFile<Categoria>(DATA_PATH);

    categorias = categorias.filter((c) => c.id !== categoriaId);

    writeFile(categorias);
    return true;
  },

  update(categoriaId: string, object: CategoriaPayload) {
    const categorias = fnReadFile<Categoria>(DATA_PATH);
    const index = categorias.findIndex((item) => item.id === categoriaId);

    const updatedCategoria = {
      ...categorias[index],
      ...fnPickFields(object, ["nome"]),
      updatedAt: new Date().toISOString(),
    };

    // substitui o item na posição index com novo objeto na posição encontrada
    categorias[index] = updatedCategoria;

    writeFile(categorias);
    return updatedCategoria;
  },
};
