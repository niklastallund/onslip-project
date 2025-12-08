import { useState, useRef } from "react";
import type Konva from "konva";
import type { Table } from "../types/table";
import type { Line as LineType } from "../types/line";
import { createTable } from "../types/table";
import { createLine } from "../types/line";
import { getNextTableId, getTableName } from "../lib/tableHelpers";
import { findNearestEndpoint } from "../lib/lineHelpers";
import { getRelativePointerPosition } from "../lib/stageHelpers";

interface UseDrawingModeProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  lines: LineType[];
  setLines: React.Dispatch<React.SetStateAction<LineType[]>>;
  setSelectedId: (id: string | null) => void;
  snapIndicatorStartRef: React.RefObject<Konva.Circle | null>;
  snapIndicatorEndRef: React.RefObject<Konva.Circle | null>;
  SNAP_THRESHOLD: number;
  hideSnapIndicators: () => void;
}

export function useDrawingMode({
  stageRef,
  tables,
  setTables,
  lines,
  setLines,
  setSelectedId,
  snapIndicatorStartRef,
  snapIndicatorEndRef,
  SNAP_THRESHOLD,
  hideSnapIndicators,
}: UseDrawingModeProps) {
  const [tableDrawMode, setTableDrawMode] = useState(false);
  const [lineDrawMode, setLineDrawMode] = useState(false);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Preview refs
  const previewRectRef = useRef<Konva.Rect | null>(null);
  const previewLineRef = useRef<Konva.Line | null>(null);

  // Toggle table drawing mode
  const toggleDrawMode = () => {
    const newDrawMode = !tableDrawMode;
    setTableDrawMode(newDrawMode);
    if (newDrawMode) {
      setLineDrawMode(false);
    }
    isDrawingRef.current = false;
    drawStartRef.current = null;

    // Hide preview and snap indicators
    if (previewRectRef.current) {
      previewRectRef.current.visible(false);
      previewRectRef.current.getLayer()?.batchDraw();
    }
    if (previewLineRef.current) {
      previewLineRef.current.visible(false);
      previewLineRef.current.getLayer()?.batchDraw();
    }
    hideSnapIndicators();
  };

  // Toggle line drawing mode
  const toggleLineDrawMode = () => {
    const newLineDrawMode = !lineDrawMode;
    setLineDrawMode(newLineDrawMode);
    if (newLineDrawMode) {
      setTableDrawMode(false);
    }
    isDrawingRef.current = false;
    drawStartRef.current = null;

    // Hide preview and snap indicators
    if (previewRectRef.current) {
      previewRectRef.current.visible(false);
      previewRectRef.current.getLayer()?.batchDraw();
    }
    if (previewLineRef.current) {
      previewLineRef.current.visible(false);
      previewLineRef.current.getLayer()?.batchDraw();
    }
    hideSnapIndicators();
  };

  // Handle stage mouse down
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    // Check if we're in a drawing mode
    if (!tableDrawMode && !lineDrawMode) {
      if (!clickedOnEmpty) {
        return;
      }
      // Deselect when clicking on empty canvas
      setSelectedId(null);
      return;
    }

    // In drawing mode, don't start drawing if clicking on tables
    if (e.target !== e.target.getStage()) {
      const targetName = e.target.name();
      const targetParent = e.target.parent;

      if (targetName === "table" || targetParent?.name?.() === "table") {
        return;
      }
    }

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = getRelativePointerPosition(stage);
    if (!pointer) return;

    isDrawingRef.current = true;

    // For line mode, snap to nearest endpoint
    let startPoint = { x: pointer.x, y: pointer.y };
    if (lineDrawMode) {
      const snapPoint = findNearestEndpoint(
        pointer.x,
        pointer.y,
        lines,
        SNAP_THRESHOLD
      );
      if (snapPoint) {
        startPoint = snapPoint;
        if (snapIndicatorStartRef.current) {
          snapIndicatorStartRef.current.setAttrs({
            x: snapPoint.x,
            y: snapPoint.y,
            visible: true,
          });
          snapIndicatorStartRef.current.getLayer()?.batchDraw();
        }
      }
    }

    drawStartRef.current = startPoint;

    if (tableDrawMode && previewRectRef.current) {
      previewRectRef.current.setAttrs({
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
        visible: true,
      });
      previewRectRef.current.getLayer()?.batchDraw();
    }

    if (lineDrawMode && previewLineRef.current) {
      previewLineRef.current.setAttrs({
        points: [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        visible: true,
      });
      previewLineRef.current.getLayer()?.batchDraw();
    }
  };

  // Handle stage mouse move
  const handleStageMouseMove = () => {
    if ((!tableDrawMode && !lineDrawMode) || !isDrawingRef.current) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = getRelativePointerPosition(stage);
    if (!pointer || !drawStartRef.current) return;

    if (tableDrawMode) {
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
    }

    if (lineDrawMode) {
      const startX = drawStartRef.current.x;
      const startY = drawStartRef.current.y;

      // Check for snap to endpoint
      let endPoint = { x: pointer.x, y: pointer.y };
      const snapPoint = findNearestEndpoint(
        pointer.x,
        pointer.y,
        lines,
        SNAP_THRESHOLD
      );

      if (snapPoint) {
        endPoint = snapPoint;
        if (snapIndicatorEndRef.current) {
          snapIndicatorEndRef.current.setAttrs({
            x: snapPoint.x,
            y: snapPoint.y,
            visible: true,
          });
          snapIndicatorEndRef.current.getLayer()?.batchDraw();
        }
      } else {
        if (snapIndicatorEndRef.current) {
          snapIndicatorEndRef.current.visible(false);
          snapIndicatorEndRef.current.getLayer()?.batchDraw();
        }
      }

      if (previewLineRef.current) {
        previewLineRef.current.setAttrs({
          points: [startX, startY, endPoint.x, endPoint.y],
          visible: true,
        });
        previewLineRef.current.getLayer()?.batchDraw();
      }
    }
  };

  // Handle stage mouse up
  const handleStageMouseUp = () => {
    if ((!tableDrawMode && !lineDrawMode) || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tableDrawMode) {
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
      const name = getTableName(id);
      const newTable = createTable({
        id,
        name,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        capacity: 4,
      });
      setTables((prevTables) => [...prevTables, newTable]);

      previewRect.visible(false);
      previewRect.getLayer()?.batchDraw();
    }

    if (lineDrawMode) {
      const previewLine = previewLineRef.current;
      if (!previewLine || !drawStartRef.current) return;

      const points = previewLine.points();
      if (points.length < 4) {
        previewLine.visible(false);
        previewLine.getLayer()?.batchDraw();
        hideSnapIndicators();
        return;
      }

      // Check minimum line length
      const dx = points[2] - points[0];
      const dy = points[3] - points[1];
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length < 10) {
        previewLine.visible(false);
        previewLine.getLayer()?.batchDraw();
        hideSnapIndicators();
        return;
      }

      const newLine = createLine({
        id: `line-${Date.now()}`,
        points: points.map(Math.round),
      });
      setLines((prevLines) => [...prevLines, newLine]);

      previewLine.visible(false);
      previewLine.getLayer()?.batchDraw();
      hideSnapIndicators();
    }
  };

  return {
    tableDrawMode,
    lineDrawMode,
    previewRectRef,
    previewLineRef,
    toggleDrawMode,
    toggleLineDrawMode,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  };
}
