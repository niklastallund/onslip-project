import type { Table } from "../types/table";

/**
 * Return next available numeric table ID.
 */
export function getNextTableId(tables: Table[]): number {
  if (tables.length === 0) return 1;
  const maxId = Math.max(...tables.map((t) => t.id));
  return maxId + 1;
}

/**
 * Generate a table name based on the ID.
 * Example: 1 -> "T-1", 2 -> "T-2"
 */
export function getTableName(id: number, prefix: string = "T-"): string {
  return `${prefix}${id}`;
}
