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

/**
 * Calculate non-overlapping positions for multiple tables.
 * Places tables in a grid layout with spacing.
 */
export function calculateTablePositions(
  count: number,
  width: number,
  height: number,
  startX: number = 50,
  startY: number = 50,
  spacing: number = 20
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  // Calculate grid dimensions
  // Try to make roughly square layout
  const cols = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = startX + col * (width + spacing);
    const y = startY + row * (height + spacing);

    positions.push({ x, y });
  }

  return positions;
}
