import { readFileSync } from "fs";

export function fnReadFile<T>(DATA_PATH: string): T[] {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    return [];
  }
}