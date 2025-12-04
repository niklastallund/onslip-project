import { useState, useRef } from "react";
import type Konva from "konva";
import type { Line as LineType } from "../types/line";

export function useLineManagement(initialLines: LineType[] = []) {
  const [lines, setLines] = useState<LineType[]>(initialLines);
  const snapIndicatorStartRef = useRef<Konva.Circle | null>(null);
  const snapIndicatorEndRef = useRef<Konva.Circle | null>(null);

  const SNAP_THRESHOLD = 15;

  // Update line points
  const handleLineUpdate = (id: string, points: number[]) => {
    setLines((prevLines) =>
      prevLines.map((line) => (line.id === id ? { ...line, points } : line))
    );
  };

  // Control snap indicator visibility
  const handleSnapIndicator = (show: boolean, x?: number, y?: number) => {
    if (show && x !== undefined && y !== undefined) {
      if (snapIndicatorEndRef.current) {
        snapIndicatorEndRef.current.setAttrs({
          x,
          y,
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
  };

  // Hide snap indicators
  const hideSnapIndicators = () => {
    if (snapIndicatorStartRef.current) {
      snapIndicatorStartRef.current.visible(false);
      snapIndicatorStartRef.current.getLayer()?.batchDraw();
    }
    if (snapIndicatorEndRef.current) {
      snapIndicatorEndRef.current.visible(false);
      snapIndicatorEndRef.current.getLayer()?.batchDraw();
    }
  };

  return {
    lines,
    setLines,
    snapIndicatorStartRef,
    snapIndicatorEndRef,
    SNAP_THRESHOLD,
    handleLineUpdate,
    handleSnapIndicator,
    hideSnapIndicators,
  };
}
