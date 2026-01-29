"use client";

import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Product {
  id: number;
  name: string;
  price?: number;
  description?: string;
  productGroup?: string;
  "product-group"?: number;
}

interface ProductGroupsListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  addingProductId: number | null;
  currentState?: string;
}

export default function ProductGroupsList({
  products,
  onProductClick,
  addingProductId,
  currentState,
}: ProductGroupsListProps) {
  const [showAll, setShowAll] = useState(false);

  // Group products by product group
  const groupProductsByGroup = () => {
    const grouped = new Map<string, Product[]>();

    products.forEach((product) => {
      const group = product.productGroup || "other";
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group)!.push(product);
    });

    return grouped;
  };

  // Filter product groups based on current state
  const filterGroupsByState = (grouped: Map<string, Product[]>) => {
    if (!currentState || showAll) return grouped;

    const stateKey = currentState.split(":")[1]?.toLowerCase();
    if (!stateKey) return grouped;

    const filtered = new Map<string, Product[]>();

    // If state starts with "food", only show Food group
    if (stateKey.startsWith("food")) {
      const foodProducts = grouped.get("Food");
      if (foodProducts) {
        filtered.set("Food", foodProducts);
      }
    }
    // If state starts with "drinks", only show Drinks group
    else if (stateKey.startsWith("drinks")) {
      const drinksProducts = grouped.get("Drinks");
      if (drinksProducts) {
        filtered.set("Drinks", drinksProducts);
      }
    }
    // For other states, show all groups
    else {
      return grouped;
    }

    return filtered;
  };

  // Check if filtering is active
  const isFilteringActive = () => {
    if (!currentState) return false;
    const stateKey = currentState.split(":")[1]?.toLowerCase();
    return (
      stateKey?.startsWith("food") || stateKey?.startsWith("drinks") || false
    );
  };

  const filteredGroups = filterGroupsByState(groupProductsByGroup());

  if (products.length === 0) {
    return (
      <div className="pt-2 border-t border-blue-300">
        <h4 className="font-semibold text-gray-800 mb-3">Add Products</h4>
        <p className="text-gray-500 italic text-xs">
          No products available. Create products first.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-blue-300">
      <h4 className="font-semibold text-gray-800 mb-3">Add Products</h4>
      <div className="space-y-4">
        {Array.from(filteredGroups.entries()).map(
          ([groupName, groupProducts]) => (
            <div key={groupName}>
              <h5 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                {groupName.replace(/_/g, " ")}
              </h5>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-1 mb-3">
                  {groupProducts.map((product: Product) => (
                    <button
                      key={product.id}
                      onClick={() => onProductClick(product)}
                      disabled={addingProductId === product.id}
                      className="shrink-0 w-32 p-2 bg-linear-to-br from-blue-50 to-blue-100 border border-blue-300 rounded hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      title={product.description || product.name}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-800 text-left line-clamp-1 mb-0.5">
                          {product.name}
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          {product.price?.toFixed(2) || "0.00"} kr
                        </span>
                        {addingProductId === product.id && (
                          <span className="text-xs text-gray-600 mt-0.5">
                            Adding...
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          ),
        )}
      </div>

      {/* Show All button when filtering is active */}
      {isFilteringActive() && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          Show All Product Groups
        </button>
      )}

      {/* Show Filtered button when showing all during a filtered state */}
      {isFilteringActive() && showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 w-full py-2 px-4 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition-colors text-sm font-medium"
        >
          Show Filtered Groups Only
        </button>
      )}
    </div>
  );
}
