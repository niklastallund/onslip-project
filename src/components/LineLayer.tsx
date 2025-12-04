import { Layer, Circle, Rect, Line } from "react-konva";
import type Konva from "konva";
import type { Line as LineType } from "../types/line";
import EditableLine from "./EditableLine";

interface LineLayerProps {
  lines: LineType[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  handleLineUpdate: (id: string, points: number[]) => void;
  handleSnapIndicator: (show: boolean, x?: number, y?: number) => void;
  snapIndicatorStartRef: React.MutableRefObject<Konva.Circle | null>;
  snapIndicatorEndRef: React.MutableRefObject<Konva.Circle | null>;
  previewRectRef: React.MutableRefObject<Konva.Rect | null>;
  previewLineRef: React.MutableRefObject<Konva.Line | null>;
  snapThreshold: number;
}

export default function LineLayer({
  lines,
  selectedId,
  setSelectedId,
  handleLineUpdate,
  handleSnapIndicator,
  snapIndicatorStartRef,
  snapIndicatorEndRef,
  previewRectRef,
  previewLineRef,
  snapThreshold,
}: LineLayerProps) {
  return (
    <Layer>
      {lines.map((line) => (
        <EditableLine
          key={line.id}
          line={line}
          isSelected={selectedId === line.id}
          allLines={lines}
          snapThreshold={snapThreshold}
          onSelect={(id) => setSelectedId(id)}
          onUpdate={handleLineUpdate}
          onSnapIndicator={handleSnapIndicator}
        />
      ))}

      {/* Preview rect for table drawing */}
      <Rect
        ref={previewRectRef}
        fill="rgba(100, 150, 255, 0.3)"
        stroke="blue"
        strokeWidth={2}
        dash={[5, 5]}
        visible={false}
        listening={false}
      />

      {/* Preview line for line drawing */}
      <Line
        ref={previewLineRef}
        stroke="gray"
        strokeWidth={2}
        dash={[5, 5]}
        visible={false}
        listening={false}
      />

      {/* Snap indicators */}
      <Circle
        ref={snapIndicatorStartRef}
        radius={6}
        fill="#10b981"
        stroke="white"
        strokeWidth={2}
        visible={false}
        listening={false}
      />
      <Circle
        ref={snapIndicatorEndRef}
        x={0}
        y={0}
        radius={6}
        fill="#10b981"
        stroke="white"
        strokeWidth={2}
        visible={false}
        listening={false}
      />
    </Layer>
  );
}
