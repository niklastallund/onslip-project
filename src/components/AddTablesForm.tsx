"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddTablesFormProps {
  onAddTables: (config: TableCreationConfig) => void;
}

export interface TableCreationConfig {
  width: number;
  height: number;
  maxCapacity: number;
  minCapacity: number;
  count: number;
}

export default function AddTablesForm({ onAddTables }: AddTablesFormProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(120);
  const [height, setHeight] = useState(80);
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [minCapacity, setMinCapacity] = useState(2);
  const [count, setCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (
      width <= 0 ||
      height <= 0 ||
      maxCapacity <= 0 ||
      minCapacity <= 0 ||
      count <= 0
    ) {
      alert("All values must be greater than 0");
      return;
    }

    if (minCapacity > maxCapacity) {
      alert("Min capacity cannot be greater than max capacity");
      return;
    }

    onAddTables({
      width,
      height,
      maxCapacity,
      minCapacity,
      count,
    });

    // Reset form and close
    setWidth(120);
    setHeight(80);
    setMaxCapacity(4);
    setMinCapacity(2);
    setCount(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-purple-500 hover:bg-purple-600">
          Add Tables
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tables</DialogTitle>
          <DialogDescription>
            Create multiple tables with the same specifications
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="30"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="30"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Guests
              </label>
              <input
                type="number"
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Guests
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Tables
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
              Create Tables
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
