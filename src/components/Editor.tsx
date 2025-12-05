"use client";

import { useEffect, useRef } from "react";
import { Stage, Layer, Image } from "react-konva";
import { useImage } from "react-konva-utils";
import type { Table } from "../types/table";
import { createTable } from "../types/table";
import type { Line as LineType } from "../types/line";
import TableStateControls from "./TableStateControls";
import StageControls from "./StageControls";
import TableLayer from "./TableLayer";
import LineLayer from "./LineLayer";
import TableDialog from "./TableDialog";
import { useStageControls } from "../hooks/useStageControls";
import { useTableManagement } from "../hooks/useTableManagement";
import { useLineManagement } from "../hooks/useLineManagement";
import { useDrawingMode } from "../hooks/useDrawingMode";
import { useTableStates } from "../hooks/useTableStates";


export default function Editor() {
  const [backgroundImage] = useImage("/demo-floorplan.svg");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stage controls (size, position, scale, zoom)
  const {
    stageRef,
    stageSize,
    stagePos,
    stageScale,
    setStagePos,
    handleWheel,
  } = useStageControls(containerRef);

  // Table management (tables, selection, drag, transform, lock)
  const {
    tables,
    setTables,
    selectedId,
    setSelectedId,
    selectedTable,
    tableRefs,
    transformerRef,
    dialogOpen,
    setDialogOpen,
    handleTableClick,
    handleDragEnd,
    handleTransformEnd,
    handleToggleLock,
  } = useTableManagement([]);

  // Line management (lines, snap indicators)
  const {
    lines,
    setLines,
    snapIndicatorStartRef,
    snapIndicatorEndRef,
    SNAP_THRESHOLD,
    handleLineUpdate,
    handleSnapIndicator,
    hideSnapIndicators,
  } = useLineManagement();

  // Drawing mode (table/line drawing, mouse handlers)
  const {
    tableDrawMode,
    lineDrawMode,
    previewRectRef,
    previewLineRef,
    toggleDrawMode,
    toggleLineDrawMode,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  } = useDrawingMode({
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
  });

  // Table states (API integration)
  const { isStateLoading, handleStateChange } = useTableStates({
    tables,
    setTables,
    selectedId,
  });

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();

        const isTable = tables.some((t) => t.id === selectedId);
        if (isTable) {
          setTables((prevTables) =>
            prevTables.filter((t) => t.id !== selectedId)
          );
        } else {
          setLines((prevLines) => prevLines.filter((l) => l.id !== selectedId));
        }
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, tables, lines, setTables, setLines, setSelectedId]);

  // Handle import
  const handleImport = (canvasState: {
    tables: Table[];
    lines: LineType[];
  }) => {
    setTables(canvasState.tables);
    setLines(canvasState.lines);
    setSelectedId(null);
  };

  // Handle delete button
  const handleDelete = () => {
    if (!selectedId) return;

    const isTable = tables.some((t) => t.id === selectedId);
    if (isTable) {
      setTables((prevTables) => prevTables.filter((t) => t.id !== selectedId));
    } else {
      setLines((prevLines) => prevLines.filter((l) => l.id !== selectedId));
    }
    setSelectedId(null);
  };

  return (
    <div className="p-4">
      <StageControls
        tableDrawMode={tableDrawMode}
        lineDrawMode={lineDrawMode}
        onToggleTableDraw={toggleDrawMode}
        onToggleLineDraw={toggleLineDrawMode}
        tables={tables}
        lines={lines}
        onImport={handleImport}
        selectedId={selectedId}
        onDelete={handleDelete}
      />

      <div
        ref={containerRef}
        className="w-[1200px] h-[600px] border border-gray-300"
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={!tableDrawMode && !lineDrawMode}
          onWheel={handleWheel}
          onDragMove={(e) => {
            const isDraggingShape = e.target !== e.target.getStage();
            if (isDraggingShape) {
              const stage = e.target.getStage();
              if (stage) {
                stage.position(stagePos);
              }
            }
          }}
          onDragEnd={(e) => {
            if (e.target === e.target.getStage()) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
          style={{ display: "block" }}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
        >
          {/* Background Layer */}
          <Layer listening={false}>
            {backgroundImage && (
              <Image
                image={backgroundImage}
                alt="image not found"
                width={backgroundImage.width}
                height={backgroundImage.height}
              />
            )}
          </Layer>

          {/* Tables Layer */}
          <TableLayer
            tables={tables}
            selectedId={selectedId}
            setSelectedId={handleTableClick}
            handleDragEnd={handleDragEnd}
            handleTransformEnd={handleTransformEnd}
            tableRefs={tableRefs}
            transformerRef={transformerRef}
          />

          {/* Lines Layer */}
          <LineLayer
            lines={lines}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            handleLineUpdate={handleLineUpdate}
            handleSnapIndicator={handleSnapIndicator}
            snapIndicatorStartRef={snapIndicatorStartRef}
            snapIndicatorEndRef={snapIndicatorEndRef}
            previewRectRef={previewRectRef}
            previewLineRef={previewLineRef}
            snapThreshold={SNAP_THRESHOLD}
          />
        </Stage>
      </div>

      {/* State controls for selected table */}
      {selectedTable && (
        <TableStateControls
          tableName={selectedTable.label || selectedTable.id}
          currentState={selectedTable.currentState || null}
          isLocked={selectedTable.locked}
          onToggleLock={handleToggleLock}
        />
      )}

      {/* Table details dialog */}
      <TableDialog
        table={selectedTable || null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPreviousState={() => handleStateChange("prev")}
        onNextState={() => handleStateChange("next")}
        isLoading={isStateLoading}
      />
    </div>
  );
}
