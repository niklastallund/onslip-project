"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  tableName: string;
  currentState: string | null;
  onPreviousState: () => void;
  onNextState: () => void;
  isLoading?: boolean;
};

export default function TableStateControls({
  tableName,
  currentState,
  onPreviousState,
  onNextState,
  isLoading,
}: Props) {
  const displayState = currentState
    ? currentState.split(":")[1]?.replace(/_/g, " ")
    : "No state";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex items-center gap-4">
      <div className="text-sm">
        <div className="font-semibold text-gray-700">{tableName}</div>
        <div className="text-gray-500 capitalize">{displayState}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onPreviousState}
          disabled={isLoading}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Previous state"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextState}
          disabled={isLoading}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Next state"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
