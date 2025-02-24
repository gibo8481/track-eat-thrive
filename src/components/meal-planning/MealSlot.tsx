
import { Button } from "@/components/ui/button";
import { RecipeSelector } from "./RecipeSelector";

interface MealSlotProps {
  mealType: string;
  plannedMeal: any;
  onSelectRecipe: (recipe: any) => void;
}

export const MealSlot = ({ mealType, plannedMeal, onSelectRecipe }: MealSlotProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium capitalize">{mealType}</h4>
      <RecipeSelector
        onSelect={(recipe) => {
          if (recipe) {
            onSelectRecipe(recipe);
          }
        }}
        trigger={
          <Button
            variant="outline"
            className="h-auto w-full justify-start p-2 text-left"
          >
            {plannedMeal?.recipes ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {plannedMeal.recipes.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plannedMeal.recipes.prep_time_minutes +
                    plannedMeal.recipes.cooking_time_minutes}{" "}
                  min • {plannedMeal.recipes.rating}⭐
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Click to select a meal
              </span>
            )}
          </Button>
        }
      />
    </div>
  );
};
