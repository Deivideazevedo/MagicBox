import { readFileSync, writeFileSync } from "fs";

export function fnReadFile<T>(DATA_PATH: string): T[] {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    return [];
  }
}


export function fnWriteFile<T>(DATA_PATH: string, data: T[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}