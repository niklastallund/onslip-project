import type { Line } from "../types/line";

/**
 * Find the nearest line endpoint within a given threshold distance
 */
export function findNearestEndpoint(
  x: number,
  y: number,
  lines: Line[],
  threshold: number,
  excludeLineId?: string
): { x: number; y: number; lineId: string; isStart: boolean } | null {
  let nearestPoint: {
    x: number;
    y: number;
    lineId: string;
    isStart: boolean;
  } | null = null;
  let minDistance = threshold;

  lines.forEach((line) => {
    if (excludeLineId && line.id === excludeLineId) return;

    const points = line.points;
    // Check start point (first two values)
    if (points.length >= 2) {
      const startX = points[0];
      const startY = points[1];
      const distStart = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
      if (distStart < minDistance) {
        minDistance = distStart;
        nearestPoint = { x: startX, y: startY, lineId: line.id, isStart: true };
      }
    }
    // Check end point (last two values)
    if (points.length >= 4) {
      const endX = points[points.length - 2];
      const endY = points[points.length - 1];
      const distEnd = Math.sqrt((x - endX) ** 2 + (y - endY) ** 2);
      if (distEnd < minDistance) {
        minDistance = distEnd;
        nearestPoint = { x: endX, y: endY, lineId: line.id, isStart: false };
      }
    }
  });

  return nearestPoint;
}

/**
 * Calculate the distance from a point to a line segment
 */
export function distanceToLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is near a line (within threshold)
 */
export function isPointNearLine(
  px: number,
  py: number,
  line: Line,
  threshold: number
): boolean {
  const points = line.points;
  if (points.length < 4) return false;

  const x1 = points[0];
  const y1 = points[1];
  const x2 = points[2];
  const y2 = points[3];

  return distanceToLine(px, py, x1, y1, x2, y2) <= threshold;
}

/**
 * Update a specific endpoint of a line with snapping
 */
export function updateLineEndpoint(
  line: Line,
  isStart: boolean,
  newX: number,
  newY: number,
  lines: Line[],
  snapThreshold: number
): number[] {
  const snapPoint = findNearestEndpoint(
    newX,
    newY,
    lines,
    snapThreshold,
    line.id
  );
  const finalX = snapPoint ? snapPoint.x : newX;
  const finalY = snapPoint ? snapPoint.y : newY;

  const newPoints = [...line.points];
  if (isStart) {
    newPoints[0] = finalX;
    newPoints[1] = finalY;
  } else {
    newPoints[2] = finalX;
    newPoints[3] = finalY;
  }

  return newPoints;
}

/**
 * Move an entire line by a delta amount
 */
export function moveLine(line: Line, dx: number, dy: number): number[] {
  return line.points.map((val, idx) => {
    return idx % 2 === 0 ? val + dx : val + dy;
  });
}
