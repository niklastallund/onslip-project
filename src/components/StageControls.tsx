import DrawSquareButton from "./DrawSquareButton";
import DrawLineButton from "./DrawLineButton";
import ExportImportButtons from "./ExportImportButtons";
import AddTablesForm, { type TableCreationConfig } from "./AddTablesForm";
import type { Table } from "../types/table";
import type { Line as LineType } from "../types/line";

interface StageControlsProps {
  tableDrawMode: boolean;
  lineDrawMode: boolean;
  onToggleTableDraw: () => void;
  onToggleLineDraw: () => void;
  tables: Table[];
  lines: LineType[];
  onImport: (canvasState: { tables: Table[]; lines: LineType[] }) => void;
  selectedId: number | null;
  onDelete: () => void;
  onAddTables: (config: TableCreationConfig) => void;
}

export default function StageControls({
  tableDrawMode,
  lineDrawMode,
  onToggleTableDraw,
  onToggleLineDraw,
  tables,
  lines,
  onImport,
  selectedId,
  onDelete,
  onAddTables,
}: StageControlsProps) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <AddTablesForm onAddTables={onAddTables} />
      <DrawSquareButton
        isDrawing={tableDrawMode}
        onToggle={onToggleTableDraw}
      />
      <DrawLineButton isDrawing={lineDrawMode} onToggle={onToggleLineDraw} />
      <button
        onClick={onDelete}
        disabled={!selectedId}
        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        title="Delete selected item (Delete/Backspace)"
      >
        Delete
      </button>
      <span className="ml-3 text-sm text-gray-600">
        Selected: {selectedId ?? "—"}
      </span>
      <ExportImportButtons tables={tables} lines={lines} onImport={onImport} />
    </div>
  );
}
