
import { useState, useEffect } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { RecipeSelector } from "./RecipeSelector";
import { ShoppingList } from "./ShoppingList";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

export const WeeklyMealPlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Get or create meal plan for current week
  const { data: mealPlan, isLoading: mealPlanLoading } = useQuery({
    queryKey: ["mealPlan", currentWeek],
    queryFn: async () => {
      const { data: existingPlan, error: fetchError } = await supabase
        .from("meal_plans")
        .select("*, planned_meals(*, recipes(*))")
        .eq("week_start_date", format(currentWeek, "yyyy-MM-dd"))
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (!existingPlan) {
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({
            week_start_date: format(currentWeek, "yyyy-MM-dd"),
          })
          .select("*")
          .single();

        if (createError) throw createError;
        return newPlan;
      }

      return existingPlan;
    },
  });

  // Add meal to plan
  const addMealMutation = useMutation({
    mutationFn: async ({
      recipe,
      dayOfWeek,
      mealType,
    }: {
      recipe: any;
      dayOfWeek: number;
      mealType: string;
    }) => {
      const { error } = await supabase.from("planned_meals").upsert({
        meal_plan_id: mealPlan?.id,
        recipe_id: recipe.id,
        day_of_week: dayOfWeek,
        meal_type: mealType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      toast({
        title: "Meal added",
        description: "The meal has been added to your plan.",
      });
    },
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addDays(prev, 7));
  };

  if (mealPlanLoading) {
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
          <h3 className="font-semibold">
            Week of {format(currentWeek, "MMMM d, yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            className="ml-4"
            onClick={() => setShowShoppingList(true)}
          >
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
              {MEAL_TYPES.map((mealType) => {
                const plannedMeal = mealPlan?.planned_meals?.find(
                  (meal: any) =>
                    meal.day_of_week === dayIndex && meal.meal_type === mealType
                );

                return (
                  <div key={mealType} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{mealType}</h4>
                    <RecipeSelector
                      onSelect={(recipe) =>
                        addMealMutation.mutate({
                          recipe,
                          dayOfWeek: dayIndex,
                          mealType,
                        })
                      }
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
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <ShoppingList
        mealPlanId={mealPlan?.id}
        open={showShoppingList}
        onOpenChange={setShowShoppingList}
      />
    </div>
  );
};
