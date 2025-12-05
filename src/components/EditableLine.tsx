"use client";

import { Line, Circle, Group } from "react-konva";
import Konva from "konva";
import type { Line as LineType } from "../types/line";

interface EditableLineProps {
  line: LineType;
  isSelected: boolean;
  allLines: LineType[];
  snapThreshold: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, points: number[]) => void;
  onSnapIndicator?: (show: boolean, x?: number, y?: number) => void;
}

export default function EditableLine({
  line,
  isSelected,
  allLines,
  snapThreshold,
  onSelect,
  onUpdate,
  onSnapIndicator,
}: EditableLineProps) {
  const points = line.points;
  const x1 = points[0];
  const y1 = points[1];
  const x2 = points[2];
  const y2 = points[3];

  // Find nearest endpoint for snapping
  const findSnapPoint = (
    x: number,
    y: number
  ): { x: number; y: number } | null => {
    let nearestPoint: { x: number; y: number } | null = null;
    let minDistance = snapThreshold;

    allLines.forEach((otherLine) => {
      if (otherLine.id === line.id) return;

      const otherPoints = otherLine.points;
      // Check start point
      if (otherPoints.length >= 2) {
        const dist = Math.sqrt(
          (x - otherPoints[0]) ** 2 + (y - otherPoints[1]) ** 2
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestPoint = { x: otherPoints[0], y: otherPoints[1] };
        }
      }
      // Check end point
      if (otherPoints.length >= 4) {
        const dist = Math.sqrt(
          (x - otherPoints[2]) ** 2 + (y - otherPoints[3]) ** 2
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestPoint = { x: otherPoints[2], y: otherPoints[3] };
        }
      }
    });

    return nearestPoint;
  };

  // Handle clicking the line to select it (mouse or touch)
  const handleLineClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    onSelect(line.id);
  };

  // Handle dragging anchor points (endpoints)
  const handleAnchorDragStart = () => {
    // Anchor drag started
  };

  const handleAnchorDragMove = (
    e: Konva.KonvaEventObject<DragEvent>,
    isStart: boolean
  ) => {
    const newX = e.target.x();
    const newY = e.target.y();

    const snapPoint = findSnapPoint(newX, newY);
    const finalX = snapPoint?.x ?? newX;
    const finalY = snapPoint?.y ?? newY;

    // Show snap indicator
    if (snapPoint && onSnapIndicator) {
      onSnapIndicator(true, snapPoint.x, snapPoint.y);
    } else if (onSnapIndicator) {
      onSnapIndicator(false);
    }

    // Update anchor position
    e.target.position({ x: finalX, y: finalY });

    const newPoints = [...line.points];
    if (isStart) {
      newPoints[0] = finalX;
      newPoints[1] = finalY;
    } else {
      newPoints[2] = finalX;
      newPoints[3] = finalY;
    }

    onUpdate(line.id, newPoints);
  };

  const handleAnchorDragEnd = () => {
    if (onSnapIndicator) {
      onSnapIndicator(false);
    }
  };

  return (
    <Group>
      {/* The main line */}
      <Line
        points={points}
        stroke={isSelected ? "#3b82f6" : "grey"}
        strokeWidth={isSelected ? 4 : 3}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={10}
        onClick={handleLineClick}
        onTap={handleLineClick}
      />

      {/* Anchor points for transforming endpoints - only show when selected */}
      {isSelected && (
        <>
          {/* Start point anchor */}
          <Circle
            x={x1}
            y={y1}
            radius={8}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2}
            draggable
            onDragStart={handleAnchorDragStart}
            onDragMove={(e) => handleAnchorDragMove(e, true)}
            onDragEnd={handleAnchorDragEnd}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "move";
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "default";
            }}
          />

          {/* End point anchor */}
          <Circle
            x={x2}
            y={y2}
            radius={8}
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2}
            draggable
            onDragStart={handleAnchorDragStart}
            onDragMove={(e) => handleAnchorDragMove(e, false)}
            onDragEnd={handleAnchorDragEnd}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "move";
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "default";
            }}
          />
        </>
      )}
    </Group>
  );
}
