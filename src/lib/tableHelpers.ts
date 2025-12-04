import type { Table } from "../types/table";

type GetNextOpts = {
  prefix?: string; // default: 'T-'
};

/**
 * Return next available table id using numeric suffixes found in existing table ids.
 * Example: if existing ids contain T1, T-2, X3 -> next will be "T-4" (prefix default 'T-')
 */
export function getNextTableId(tables: Table[], opts?: GetNextOpts) {
  const prefix = opts?.prefix ?? "T-";
  // extract first numeric group from each id
  const nums = tables
    .map((t) => {
      const m = t.id.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : NaN;
    })
    .filter((n) => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${next}`;
}
