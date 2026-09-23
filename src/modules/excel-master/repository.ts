import type { ExcelRepository, ImportBundle } from "./_types";
import { demoData } from "./demo";

let current: ImportBundle = structuredClone(demoData);

export function createMemoryRepository(): ExcelRepository {
  return {
    async read() {
      return structuredClone(current);
    },
    async replace(data) {
      current = structuredClone(data);
    },
  };
}
