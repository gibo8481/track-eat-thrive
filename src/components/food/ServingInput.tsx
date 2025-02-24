
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServingInputProps {
  servingSize: string;
  servings: string;
  onServingSizeChange: (size: string) => void;
  onServingsChange: (servings: string) => void;
}

export const ServingInput = ({
  servingSize,
  servings,
  onServingSizeChange,
  onServingsChange,
}: ServingInputProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="servingSize">Serving Size</Label>
        <Input
          id="servingSize"
          value={servingSize}
          onChange={(e) => onServingSizeChange(e.target.value)}
          required
          placeholder="e.g., 100g"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="servings">Number of Servings</Label>
        <Input
          id="servings"
          type="number"
          min="0.25"
          step="0.25"
          value={servings}
          onChange={(e) => onServingsChange(e.target.value)}
          required
        />
      </div>
    </>
  );
};
