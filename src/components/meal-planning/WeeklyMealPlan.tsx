
import { useEffect } from "react";
import { addDays, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

export const WeeklyMealPlan = () => {
  const startOfWeek = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recommendedRecipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("rating", { ascending: false })
        .limit(21); // 3 meals per day * 7 days

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <h3 className="font-semibold">Week of {format(startOfWeek, "MMMM d, yyyy")}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="default" className="ml-4">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Generate Shopping List
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {days.map((day, dayIndex) => (
          <Card key={day.toISOString()} className="min-h-[320px]">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {format(day, "EEE, MMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MEAL_TYPES.map((mealType, mealIndex) => {
                const recipeIndex = dayIndex * 3 + mealIndex;
                const recipe = recipes?.[recipeIndex];
                
                return (
                  <div key={mealType} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{mealType}</h4>
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-start p-2 text-left"
                    >
                      {recipe ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{recipe.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {recipe.prep_time_minutes + recipe.cooking_time_minutes} min
                            • {recipe.rating}⭐
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Click to select a meal
                        </span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
