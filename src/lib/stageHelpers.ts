import type Konva from "konva";

/**
 * Get pointer position relative to stage content, accounting for stage position and scale
 */
export function getRelativePointerPosition(stage: Konva.Stage) {
  const pointerPos = stage.getPointerPosition();
  if (!pointerPos) return null;

  // Transform pointer position to stage's local coordinates
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  return transform.point(pointerPos);
}

/**
 * Calculate new stage position and scale for zooming relative to pointer position
 */
export function calculateZoomPosition(
  stage: Konva.Stage,
  direction: number,
  scaleBy: number = 1.05,
  minScale: number = 0.1,
  maxScale: number = 5
): { scale: number; position: { x: number; y: number } } {
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  if (!pointer) {
    return { scale: oldScale, position: { x: stage.x(), y: stage.y() } };
  }

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  };

  return { scale: clampedScale, position: newPos };
}
