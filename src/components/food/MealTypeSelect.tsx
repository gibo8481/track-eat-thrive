
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

interface MealTypeSelectProps {
  mealType: string;
  onMealTypeChange: (type: string) => void;
}

export const MealTypeSelect = ({
  mealType,
  onMealTypeChange,
}: MealTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="mealType">Meal Type</Label>
      <Select value={mealType} onValueChange={onMealTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select meal type" />
        </SelectTrigger>
        <SelectContent>
          {MEAL_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
