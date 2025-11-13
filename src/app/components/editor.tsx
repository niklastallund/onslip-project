"use client";

import { useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";

export default function Editor() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Optional: Handle window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Don't render until we have dimensions
  if (dimensions.width === 0) return null;

  return (
    <Stage width={dimensions.width} height={dimensions.height}>
      <Layer>
        <Line
          points={[73, 192, 73, 160, 340, 23, 500, 109, 499, 139, 342, 93]}
          stroke="white"
          strokeWidth={5}
          closed
          draggable
        />
      </Layer>
    </Stage>
  );
}
