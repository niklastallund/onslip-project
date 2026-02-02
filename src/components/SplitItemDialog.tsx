"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  distributeChairPositions,
  calculateMaxChairPositions,
} from "@/lib/tableHelpers";
import type { Chair } from "@/types/table";

interface Item {
  product?: number;
  "product-name": string;
  quantity: number;
  price?: number;
  type?: string;
}

interface SplitItemDialogProps {
  item: Item | null;
  sourceChairId: number | null;
  sourceChairPosition: number | null;
  occupiedChairs: Map<number, Chair>;
  tableName: string;
  tableWidth: number;
  tableHeight: number;
  maxCapacity: number;
  currentState?: string;
  allowedPositions: Set<number>;
  onClose: () => void;
  onConfirm: (targetChairIds: number[], sharePerChair: number) => void;
}

export default function SplitItemDialog({
  item,
  sourceChairId,
  sourceChairPosition, // Passed for potential future use
  occupiedChairs,
  tableName,
  tableWidth,
  tableHeight,
  maxCapacity,
  currentState,
  allowedPositions,
  onClose,
  onConfirm,
}: SplitItemDialogProps) {
  const [selectedChairs, setSelectedChairs] = useState<Set<number>>(new Set());

  // Map state names to colors (same as canvas and ChairGrid)
  const getStateColor = (state?: string): string => {
    if (!state) return "bg-gray-100";

    const stateKey = state.split(":")[1]?.toLowerCase();

    const colorMap: Record<string, string> = {
      ready: "bg-green-300",
      guest_arrived: "bg-yellow-300",
      drinks_ordered: "bg-amber-400",
      drinks_served: "bg-orange-400",
      food_ordered: "bg-orange-500",
      food_served: "bg-amber-500",
      bill_requested: "bg-red-300",
      paid: "bg-purple-400",
      uncleaned: "bg-red-400",
      cleaned: "bg-blue-400",
    };

    return colorMap[stateKey] ?? "bg-gray-100";
  };

  const stateColor = getStateColor(currentState);

  const isOpen = item !== null && sourceChairId !== null;

  // Filter out the source chair from available chairs
  const availableChairs = Array.from(occupiedChairs.entries()).filter(
    ([, chair]) => chair.chairId !== sourceChairId,
  );

  const toggleChair = (position: number) => {
    const chair = occupiedChairs.get(position);
    if (!chair || chair.chairId === sourceChairId) return;

    setSelectedChairs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chair.chairId)) {
        newSet.delete(chair.chairId);
      } else {
        newSet.add(chair.chairId);
      }
      return newSet;
    });
  };

  // Calculate chair positions around the table
  const getChairPositions = () => {
    const positions = [];
    const distribution = distributeChairPositions(tableWidth, tableHeight);
    const maxPositions = calculateMaxChairPositions(tableWidth, tableHeight);

    let chairIndex = 0;

    // Top chairs
    for (let i = 0; i < distribution.top; i++) {
      positions.push({
        index: chairIndex++,
        side: "top",
        position: i,
        total: distribution.top,
      });
    }

    // Right chairs
    for (let i = 0; i < distribution.right; i++) {
      positions.push({
        index: chairIndex++,
        side: "right",
        position: i,
        total: distribution.right,
      });
    }

    // Bottom chairs
    for (let i = 0; i < distribution.bottom; i++) {
      positions.push({
        index: chairIndex++,
        side: "bottom",
        position: i,
        total: distribution.bottom,
      });
    }

    // Left chairs
    for (let i = 0; i < distribution.left; i++) {
      positions.push({
        index: chairIndex++,
        side: "left",
        position: i,
        total: distribution.left,
      });
    }

    // Return ALL possible positions, not limited by maxCapacity
    return positions.slice(0, maxPositions);
  };

  const chairPositions = getChairPositions();

  const topChairs = chairPositions.filter((c) => c.side === "top");
  const rightChairs = chairPositions.filter((c) => c.side === "right");
  const bottomChairs = chairPositions.filter((c) => c.side === "bottom");
  const leftChairs = chairPositions.filter((c) => c.side === "left");

  const renderChair = (chairInfo: {
    index: number;
    side: string;
    position: number;
    total: number;
  }) => {
    const chair = occupiedChairs.get(chairInfo.index);
    const isOccupied = chair !== undefined;
    const isSource = chair?.chairId === sourceChairId;
    const isSelected = chair ? selectedChairs.has(chair.chairId) : false;
    const isAvailable = allowedPositions.has(chairInfo.index);
    const canSelect = isOccupied && !isSource && isAvailable;

    const baseClasses =
      "w-8 h-8 flex items-center justify-center border-2 rounded transition-colors select-none text-xs font-semibold";

    let colorClasses = "";
    let cursorClass = "";

    if (!isAvailable) {
      // Position not available/disabled
      colorClasses = "bg-gray-100 border-gray-300 text-gray-400";
      cursorClass = "cursor-not-allowed";
    } else if (isSource) {
      colorClasses = "bg-blue-500 border-blue-700 text-white";
      cursorClass = "cursor-not-allowed";
    } else if (isSelected) {
      colorClasses =
        "bg-green-500 border-green-700 text-white hover:bg-green-600";
      cursorClass = "cursor-pointer";
    } else if (isOccupied) {
      colorClasses =
        "bg-amber-400 border-amber-600 text-white hover:bg-amber-500";
      cursorClass = "cursor-pointer";
    } else {
      // Empty position - visible but not selectable
      colorClasses = "bg-gray-200 border-gray-400 text-gray-600";
      cursorClass = "cursor-not-allowed";
    }

    return (
      <button
        key={chairInfo.index}
        onClick={() => canSelect && toggleChair(chairInfo.index)}
        disabled={!canSelect}
        className={`${baseClasses} ${colorClasses} ${cursorClass} ${!canSelect ? "opacity-60" : ""}`}
        title={
          !isAvailable
            ? `Position ${chairInfo.index + 1} - Not available`
            : isSource
              ? "Source chair (cannot split with itself)"
              : isOccupied
                ? `Chair ${chairInfo.index + 1}${isSelected ? " - Selected for split" : " - Click to select"}`
                : `Position ${chairInfo.index + 1} - Empty`
        }
      >
        {!isAvailable
          ? "–"
          : isOccupied || isSource
            ? chairInfo.index + 1
            : "–"}
      </button>
    );
  };

  const handleConfirm = () => {
    if (selectedChairs.size === 0 || !item?.price) {
      return;
    }

    // Total chairs = selected + source chair
    const totalChairs = selectedChairs.size + 1;
    const sharePerChair = item.price / totalChairs;

    onConfirm(Array.from(selectedChairs), sharePerChair);
    setSelectedChairs(new Set());
  };

  const handleClose = () => {
    setSelectedChairs(new Set());
    onClose();
  };

  if (!item) return null;

  const totalChairs = selectedChairs.size + 1;
  const sharePerChair = item.price ? item.price / totalChairs : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Item</DialogTitle>
          <DialogDescription>
            Split &quot;{item["product-name"]}&quot; with other chairs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 mb-1">Original Price</div>
            <div className="text-xl font-bold text-gray-900">
              {item.price?.toFixed(2)} kr
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Select chairs to split with
            </label>

            {availableChairs.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8 border rounded-md bg-gray-50">
                No other occupied chairs available
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full p-6 border border-purple-300 rounded-lg bg-purple-50">
                {/* Visual Table Layout */}
                <div className="flex flex-col items-center">
                  {/* Top chairs */}
                  <div className="flex gap-2 mb-2">
                    {topChairs.map((chairInfo) => renderChair(chairInfo))}
                  </div>

                  {/* Middle row with left chairs, table, and right chairs */}
                  <div className="flex items-center gap-2">
                    {/* Left chairs */}
                    <div className="flex flex-col gap-2">
                      {leftChairs.map((chairInfo) => renderChair(chairInfo))}
                    </div>

                    {/* Table */}
                    <div
                      className={`flex flex-col justify-center items-center border-2 border-gray-400 rounded ${stateColor} shadow-sm`}
                      style={{
                        width: `${tableWidth}px`,
                        height: `${tableHeight}px`,
                        minWidth: "100px",
                        minHeight: "60px",
                      }}
                    >
                      <span className="font-semibold text-lg text-gray-800">
                        {tableName}
                      </span>
                    </div>

                    {/* Right chairs */}
                    <div className="flex flex-col gap-2">
                      {rightChairs.map((chairInfo) => renderChair(chairInfo))}
                    </div>
                  </div>

                  {/* Bottom chairs */}
                  <div className="flex gap-2 mt-2">
                    {bottomChairs.map((chairInfo) => renderChair(chairInfo))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-purple-400 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 rounded bg-blue-500 border-blue-700"></div>
                    <span className="font-medium">Source</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 rounded bg-amber-400 border-amber-600"></div>
                    <span className="font-medium">Occupied</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 rounded bg-green-500 border-green-700"></div>
                    <span className="font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 rounded bg-gray-200 border-gray-400"></div>
                    <span className="font-medium">Empty</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedChairs.size > 0 && (
            <div className="bg-green-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total chairs:</span>
                <span className="font-semibold">{totalChairs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per chair:</span>
                <span className="font-bold text-lg text-green-900">
                  {sharePerChair.toFixed(2)} kr
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedChairs.size === 0}>
            Split Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
