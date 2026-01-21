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
 * Calculate the maximum number of chair positions that can fit around a table
 * based on its dimensions. Uses consistent spacing on all sides.
 * Accounts for visual chair size (32px) and gap (8px) to ensure chairs
 * don't extend beyond table boundaries.
 */
export function calculateMaxChairPositions(
  width: number,
  height: number,
): number {
  const chairSize = 32; // w-8 h-8 in Tailwind = 32px
  const gap = 8; // gap-2 in Tailwind = 8px
  const effectiveSpacing = chairSize + gap; // Space per chair including gap

  // Calculate chairs that fit along each side
  // Formula: N chairs need (N * chairSize) + ((N-1) * gap) space
  // Which simplifies to: N * effectiveSpacing - gap
  // Solving for N: N <= (dimension + gap) / effectiveSpacing
  const topBottomChairs = Math.max(
    1,
    Math.floor((width + gap) / effectiveSpacing),
  );
  const leftRightChairs = Math.max(
    1,
    Math.floor((height + gap) / effectiveSpacing),
  );

  // Total positions: top + right + bottom + left
  return topBottomChairs * 2 + leftRightChairs * 2;
}

/**
 * Distribute chair positions around a table based on actual dimensions.
 * Returns the number of chairs on each side.
 * Ensures chairs visually align with table boundaries.
 */
export function distributeChairPositions(
  width: number,
  height: number,
): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const chairSize = 32; // w-8 h-8 in Tailwind = 32px
  const gap = 8; // gap-2 in Tailwind = 8px
  const effectiveSpacing = chairSize + gap; // Space per chair including gap

  // Calculate chairs for horizontal sides (top and bottom) - based on width
  // Ensure chairs don't exceed table width visually
  const horizontalChairs = Math.max(
    1,
    Math.floor((width + gap) / effectiveSpacing),
  );

  // Calculate chairs for vertical sides (left and right) - based on height
  // Ensure chairs don't exceed table height visually
  const verticalChairs = Math.max(
    1,
    Math.floor((height + gap) / effectiveSpacing),
  );

  return {
    top: horizontalChairs,
    right: verticalChairs,
    bottom: horizontalChairs,
    left: verticalChairs,
  };
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
  spacing: number = 20,
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
