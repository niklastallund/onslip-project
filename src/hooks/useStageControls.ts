import { useState, useEffect, useRef } from "react";
import type Konva from "konva";
import { calculateZoomPosition } from "../lib/stageHelpers";

export function useStageControls(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [stageSize, setStageSize] = useState({ width: 300, height: 150 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  // Handle mouse wheel for zooming
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    // Determine zoom direction
    let direction = e.evt.deltaY > 0 ? -1 : 1;

    // When zooming on trackpad, e.evt.ctrlKey is true
    // In that case, reverse direction for more natural feel
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const { scale, position } = calculateZoomPosition(
      stage,
      direction,
      1.05,
      0.1,
      5
    );

    setStageScale(scale);
    setStagePos(position);
  };

  // Update and observe parent size
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const updateStageSize = () => {
      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(0, Math.round(rect.width));
      const height = Math.max(0, Math.round(rect.height));
      setStageSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };

    updateStageSize();

    // Observe size changes of the container
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateStageSize());
      resizeObserver.observe(containerEl);
    } else {
      window.addEventListener("resize", updateStageSize);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", updateStageSize);
    };
  }, [containerRef]);

  return {
    stageRef,
    stageSize,
    stagePos,
    stageScale,
    setStagePos,
    handleWheel,
  };
}
