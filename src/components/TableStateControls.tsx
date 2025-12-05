"use client";

import { Lock, Unlock } from "lucide-react";

type Props = {
  tableName: string;
  currentState: string | null;
  isLocked?: boolean;
  onToggleLock?: () => void;
};

export default function TableStateControls({
  tableName,
  currentState,
  isLocked = false,
  onToggleLock,
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
