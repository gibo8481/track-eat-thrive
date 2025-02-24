
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ServingInputProps {
  servingSize: string;
  servings: string;
  onServingSizeChange: (size: string) => void;
  onServingsChange: (servings: string) => void;
}

const COMMON_SERVING_SIZES = [
  "100g",
  "1 cup",
  "1 tbsp",
  "1 tsp",
  "1 oz",
  "1 piece",
];

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
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_SERVING_SIZES.map((size) => (
            <Button
              key={size}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onServingSizeChange(size)}
            >
              {size}
            </Button>
          ))}
        </div>
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
