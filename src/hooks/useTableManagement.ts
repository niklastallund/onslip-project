import { useState, useEffect, useRef } from "react";
import type Konva from "konva";
import type { Table } from "../types/table";

export function useTableManagement(initialTables: Table[] = []) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tableRefs = useRef<Map<string, Konva.Group>>(new Map());
  const transformerRef = useRef<Konva.Transformer | null>(null);

  // Get the currently selected table
  const selectedTable = selectedId
    ? tables.find((t) => t.id === selectedId)
    : null;

  // Handle table drag end
  const handleDragEnd = (id: string, x: number, y: number) => {
    setTables((prevTables) =>
      prevTables.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  // Handle transform end (resize/rotate)
  const handleTransformEnd = (id: string) => {
    const node = tableRefs.current.get(id);
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Calculate new dimensions
    const newWidth = Math.max(30, node.width() * scaleX);
    const newHeight = Math.max(30, node.height() * scaleY);

    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);

    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === id
          ? {
              ...t,
              x: node.x(),
              y: node.y(),
              width: newWidth,
              height: newHeight,
              rotation: node.rotation(),
            }
          : t
      )
    );
  };

  // Toggle lock state for selected table
  const handleToggleLock = () => {
    if (!selectedId) return;

    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === selectedId ? { ...t, locked: !t.locked } : t
      )
    );
  };

  // Attach transformer to selected table (only if not locked)
  useEffect(() => {
    if (transformerRef.current) {
      const table = selectedId ? tables.find((t) => t.id === selectedId) : null;
      const selectedNode = selectedId
        ? tableRefs.current.get(selectedId)
        : null;

      if (selectedNode && table && !table.locked) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedId, tables]);

  return {
    tables,
    setTables,
    selectedId,
    setSelectedId,
    selectedTable,
    tableRefs,
    transformerRef,
    handleDragEnd,
    handleTransformEnd,
    handleToggleLock,
  };
}
