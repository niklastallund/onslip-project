"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import type { Table } from "../../types/table";
import { createTable } from "../../types/table";
import { getNextTableId } from "../../lib/tableHelpers";
import TableRect from "./TableRect";
import DrawSquareButton from "./DrawSquareButton";

export default function Editor() {
  // Ref to the container div to measure size, for dynamic Stage sizing
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ref to the Konva Stage instance
  const stageRef = useRef<Konva.Stage | null>(null);

  // Sets the size of the Stage based on container size
  const [stageSize, setStageSize] = useState({ width: 300, height: 150 });

  // Holds the list of tables in the editor
  const [tables, setTables] = useState<Table[]>(() => [
    // Default tables for testing
    createTable({ id: "T1", label: "T1", x: 20, y: 20, capacity: 4 }),
    createTable({ id: "T2", label: "T2", x: 200, y: 40, capacity: 2 }),
  ]);

  // Holds the ID of the currently selected table
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState(false);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Preview: imperative Konva rect + layer for batchDraw
  const layerRef = useRef<Konva.Layer | null>(null);
  const previewRectRef = useRef<Konva.Rect | null>(null);

  // Update and observe parent size. Works in modern browsers; falls back to window resize.
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const updateStageSize = () => {
      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(0, Math.round(rect.width));
      const height = Math.max(0, Math.round(rect.height));
      setStageSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };

    updateStageSize();

    // Observe size changes of the container to dynamically adjust the Stage size.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateStageSize());
      resizeObserver.observe(containerEl);
    } else {
      window.addEventListener("resize", updateStageSize);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", updateStageSize);
    };
  }, []);

  // Set the position of a table after drag end
  const handleDragEnd = (id: string, x: number, y: number) => {
    setTables((prevTables) =>
      prevTables.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  // Toggle drawing mode on/off
  const toggleDrawMode = () => {
    setDrawMode((v) => !v);
    isDrawingRef.current = false;
    drawStartRef.current = null;

    // hide preview imperatively
    if (previewRectRef.current) {
      previewRectRef.current.visible(false);
      previewRectRef.current.getLayer()?.batchDraw();
    }
  };

  // Handlers for stage mouse events to implement drawing new tables
  const handleStageMouseDown = () => {
    if (!drawMode) return;

    const pointer = stageRef.current?.getPointerPosition?.();
    if (!pointer) return;

    isDrawingRef.current = true;
    drawStartRef.current = { x: pointer.x, y: pointer.y };

    if (previewRectRef.current) {
      previewRectRef.current.setAttrs({
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
        visible: true,
      });
      previewRectRef.current.getLayer()?.batchDraw();
    }
  };

  const handleStageMouseMove = () => {
    if (!drawMode || !isDrawingRef.current) return;

    const pointer = stageRef.current?.getPointerPosition?.();
    if (!pointer || !drawStartRef.current) return;

    const startX = drawStartRef.current.x;
    const startY = drawStartRef.current.y;
    const x = Math.min(startX, pointer.x);
    const y = Math.min(startY, pointer.y);
    const width = Math.max(1, Math.abs(pointer.x - startX));
    const height = Math.max(1, Math.abs(pointer.y - startY));

    if (previewRectRef.current) {
      previewRectRef.current.setAttrs({
        x,
        y,
        width,
        height,
        visible: true,
      });
      previewRectRef.current.getLayer()?.batchDraw();
    }
  };

  const handleStageMouseUp = () => {
    if (!drawMode || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    const previewRect = previewRectRef.current;
    if (!previewRect) return;

    const width = previewRect.width();
    const height = previewRect.height();
    const x = previewRect.x();
    const y = previewRect.y();

    if (width < 4 || height < 4) {
      previewRect.visible(false);
      previewRect.getLayer()?.batchDraw();
      return;
    }

    const id = getNextTableId(tables);
    const newTable = createTable({
      id,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
      capacity: 4,
    });
    setTables((prevTables) => [...prevTables, newTable]);

    previewRect.visible(false);
    previewRect.getLayer()?.batchDraw();
  };

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-3">
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
          width={stageSize.width}
          height={stageSize.height}
          style={{ display: "block" }}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
        >
          <Layer ref={layerRef}>
            {tables.map((table) => (
              <TableRect
                key={table.id}
                table={table}
                isSelected={selectedId === table.id}
                onSelect={(id) => setSelectedId(id)}
                onDragEnd={handleDragEnd}
              />
            ))}

            {/* Preview rectangle: always rendered but hidden until used. */}
            <Rect
              ref={(node) => {
                previewRectRef.current = node;
              }}
              x={0}
              y={0}
              width={0}
              height={0}
              visible={false}
              stroke="#2563eb"
              dash={[6, 4]}
              strokeWidth={1}
              listening={false}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
