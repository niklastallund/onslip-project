"use client";

import { Lock, Unlock, ChevronLeft, ChevronRight, Copy } from "lucide-react";

type Props = {
  tableName: string;
  currentState: string | null;
  isLocked?: boolean;
  capacity: number;
  onToggleLock?: () => void;
  onPreviousState: () => void;
  onNextState: () => void;
  onCapacityChange: (capacity: number) => void;
  onCopyTable: () => void;
  isStateLoading?: boolean;
};

const CAPACITY_OPTIONS = [2, 4, 6, 8];

export default function TableStateControls({
  tableName,
  currentState,
  isLocked = false,
  capacity,
  onToggleLock,
  onPreviousState,
  onNextState,
  onCapacityChange,
  onCopyTable,
  isStateLoading = false,
}: Props) {
  const displayState = currentState
    ? currentState.split(":")[1]?.replace(/_/g, " ")
    : "No state";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex items-center gap-6">
      <div className="text-sm">
        <div className="font-semibold text-gray-700">{tableName}</div>
        <div className="text-gray-500 capitalize">{displayState}</div>
      </div>

      {/* State navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousState}
          disabled={isStateLoading}
          className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous state"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextState}
          disabled={isStateLoading}
          className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next state"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Capacity selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">Capacity:</span>
        <div className="flex gap-1">
          {CAPACITY_OPTIONS.map((cap) => (
            <button
              key={cap}
              onClick={() => onCapacityChange(cap)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                capacity === cap
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title={`Set capacity to ${cap} seats`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Copy and Lock buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCopyTable}
          className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          title="Copy table"
        >
          <Copy className="w-4 h-4" />
        </button>
        {onToggleLock && (
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-md transition-colors ${
              isLocked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={isLocked ? "Unlock table" : "Lock table"}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
