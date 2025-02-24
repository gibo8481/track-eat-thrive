
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealSlot } from "./MealSlot";

interface DayCardProps {
  day: Date;
  dayIndex: number;
  mealPlan: any;
  mealTypes: string[];
  onSelectRecipe: (recipe: any, dayOfWeek: number, mealType: string) => void;
}

export const DayCard = ({ 
  day, 
  dayIndex, 
  mealPlan, 
  mealTypes,
  onSelectRecipe 
}: DayCardProps) => {
  return (
    <Card className="min-h-[320px]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {format(day, "EEE, MMM d")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealTypes.map((mealType) => {
          const plannedMeal = mealPlan?.planned_meals?.find(
            (meal: any) =>
              meal.day_of_week === dayIndex && meal.meal_type === mealType
          );

          return (
            <MealSlot
              key={mealType}
              mealType={mealType}
              plannedMeal={plannedMeal}
              onSelectRecipe={(recipe) => onSelectRecipe(recipe, dayIndex, mealType)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};
