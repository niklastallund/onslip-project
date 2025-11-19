export interface Line {
  id: string;
  points: number[]; // [x1, y1, x2, y2] for simple lines
}

export function createLine(opts?: Partial<Line>): Line {
  const id = opts?.id ?? `line-${Date.now()}`;
  return {
    id,
    points: opts?.points ?? [0, 0, 0, 0],
  };
}
