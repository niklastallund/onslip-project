"use client";

import { Group, Rect, Text } from "react-konva";
import type { Table } from "../types/table";

type Props = {
  table: Table;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
};

export default function TableRect({
  table,
  isSelected,
  onSelect,
  onDragEnd,
}: Props) {
  const stroke = isSelected ? "#2563eb" : "#9ca3af";
  const strokeWidth = isSelected ? 3 : 1;

  return (
    <Group
      name="table"
      x={table.x}
      y={table.y}
      draggable
      onDragEnd={(e) => onDragEnd?.(table.id, e.target.x(), e.target.y())}
    >
      <Rect
        id={table.id}
        x={0}
        y={0}
        width={table.width}
        height={table.height}
        fill={table.color ?? "#f3f4f6"}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={6}
        onClick={() => onSelect?.(table.id)}
      />
      <Text
        text={table.label ?? `Table ${table.id}`}
        fontSize={14}
        fill="#111827"
        x={8}
        y={8}
      />
      <Text
        text={`${table.capacity} seats`}
        fontSize={12}
        fill="#374151"
        x={8}
        y={table.height - 22}
      />
    </Group>
  );
}
