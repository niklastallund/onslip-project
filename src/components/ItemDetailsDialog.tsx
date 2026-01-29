"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Item {
  product?: number;
  "product-name": string;
  quantity: number;
  price?: number;
  type?: string;
}

interface Product {
  id: number;
  name: string;
  price?: number;
  description?: string;
  productGroup?: string;
  "product-group"?: number;
}

interface ItemDetailsDialogProps {
  item: Item | null;
  product: Product | null;
  onClose: () => void;
  onQuantityChange?: (quantity: number) => void;
  mode: "view" | "add";
}

export default function ItemDetailsDialog({
  item,
  product,
  onClose,
  onQuantityChange,
  mode,
}: ItemDetailsDialogProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when dialog opens with new item/product
  useEffect(() => {
    if (mode === "view" && item) {
      setQuantity(item.quantity);
    } else if (mode === "add") {
      setQuantity(1);
    }
  }, [item, mode]);

  const displayName = item?.["product-name"] || product?.name || "";
  const displayPrice = item?.price || product?.price || 0;
  const displayDescription = product?.description || "";

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleConfirm = () => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
    onClose();
  };

  const isOpen = item !== null || product !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Item Details" : "Add Product"}
          </DialogTitle>
          <DialogDescription>{displayName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity Control */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-md font-bold text-lg transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900 min-w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md font-bold text-lg transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Unit Price
              </label>
              <p className="text-gray-900">{displayPrice.toFixed(2)} kr</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Total Price
              </label>
              <p className="text-gray-900 font-bold text-lg">
                {(displayPrice * quantity).toFixed(2)} kr
              </p>
            </div>
          </div>

          {displayDescription && (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <p className="text-gray-700 text-sm mt-1">{displayDescription}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {mode === "view" ? "Update Quantity" : "Add to Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
