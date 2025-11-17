"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import type { Table } from "../../types/table";
import { createTable } from "../../types/table";
import { getNextTableId } from "../../lib/tableHelpers";
import TableRect from "./TableRect";
import DrawSquareButton from "./DrawSquareButton";

export default function Editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 300, height: 150 });
  const [tables, setTables] = useState<Table[]>(() => [
    createTable({ id: "T1", label: "T1", x: 20, y: 20, capacity: 4 }),
    createTable({ id: "T2", label: "T2", x: 200, y: 40, capacity: 2 }),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  // drawing state
  const [drawMode, setDrawMode] = useState(false);
  const drawingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  });

  // Update and observe parent size. Works in modern browsers; falls back to window resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const newW = Math.max(0, Math.round(rect.width));
      const newH = Math.max(0, Math.round(rect.height));
      setSize((prev) =>
        prev.width === newW && prev.height === newH
          ? prev
          : { width: newW, height: newH }
      );
    };

    updateSize();

    // Observer size changes of the container
    // to dynamically adjust the Stage size.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(el);
    } else {
      window.addEventListener("resize", updateSize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", updateSize);
    };
  }, []);

  const handleDragEnd = (id: string, x: number, y: number) => {
    // simple move: update position directly
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
  };

  const addTable = () => {
    const id = getNextTableId(tables);
    const newTable = createTable({
      id,
      x: 40 + Math.random() * 200,
      y: 40 + Math.random() * 120,
      capacity: 4,
    });
    setTables((t) => [...t, newTable]);
  };

  const toggleDrawMode = () => {
    setDrawMode((v) => !v);
    drawingRef.current = false;
    startRef.current = null;
    setPreview((p) => ({ ...p, visible: false }));
  };

  const handleStageMouseDown = () => {
    if (!drawMode) return;
    const pos = stageRef.current?.getPointerPosition?.();
    if (!pos) return;
    drawingRef.current = true;
    startRef.current = { x: pos.x, y: pos.y };
    setPreview({ x: pos.x, y: pos.y, width: 0, height: 0, visible: true });
  };

  const handleStageMouseMove = () => {
    if (!drawMode || !drawingRef.current) return;
    const pos = stageRef.current?.getPointerPosition?.();
    if (!pos || !startRef.current) return;
    const sx = startRef.current.x;
    const sy = startRef.current.y;
    const x = Math.min(sx, pos.x);
    const y = Math.min(sy, pos.y);
    const width = Math.max(1, Math.abs(pos.x - sx));
    const height = Math.max(1, Math.abs(pos.y - sy));
    setPreview({ x, y, width, height, visible: true });
  };

  const handleStageMouseUp = () => {
    if (!drawMode || !drawingRef.current) return;
    drawingRef.current = false;
    const p = preview;
    if (!p.visible || p.width < 4 || p.height < 4) {
      setPreview((pr) => ({ ...pr, visible: false }));
      return;
    }
    const id = getNextTableId(tables);
    const newTable = createTable({
      id,
      x: Math.round(p.x),
      y: Math.round(p.y),
      width: Math.round(p.width),
      height: Math.round(p.height),
      capacity: 4,
    });
    setTables((t) => [...t, newTable]);
    setPreview((pr) => ({ ...pr, visible: false }));
    // keep drawMode on to allow multiple draws
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={addTable}
        >
          Add table
        </button>
        <DrawSquareButton isDrawing={drawMode} onToggle={toggleDrawMode} />
        <span className="ml-3 text-sm text-gray-600">
          Selected: {selectedId ?? "—"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[420px] border border-gray-300"
      >
        {/* Stage requires explicit pixel width/height; we compute them from parent */}
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          style={{ display: "block" }}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
        >
          <Layer>
            {tables.map((table) => (
              <TableRect
                key={table.id}
                table={table}
                isSelected={selectedId === table.id}
                onSelect={(id) => setSelectedId(id)}
                onDragEnd={handleDragEnd}
              />
            ))}

            {/* preview rectangle while drawing */}
            {preview.visible && (
              <Rect
                x={preview.x}
                y={preview.y}
                width={preview.width}
                height={preview.height}
                stroke="#2563eb"
                dash={[6, 4]}
                strokeWidth={1}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
