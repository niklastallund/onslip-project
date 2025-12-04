import { Button } from "@/components/ui/button";

type Props = {
  isDrawing: boolean;
  onToggle: () => void;
};

export default function DrawSquareButton({ isDrawing, onToggle }: Props) {
  return (
    <Button
      aria-pressed={isDrawing}
      onClick={onToggle}
      className={isDrawing ? "bg-red-600" : ""}
    >
      {isDrawing ? "Drawing: Click & drag to add table" : "Draw Table"}
    </Button>
  );
}
