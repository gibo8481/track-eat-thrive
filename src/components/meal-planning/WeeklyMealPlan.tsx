
import { useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { WeekNavigation } from "./WeekNavigation";
import { DayCard } from "./DayCard";
import { ShoppingList } from "./ShoppingList";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

export const WeeklyMealPlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [showShoppingList, setShowShoppingList] = useState(false);

  const { data: mealPlan, isLoading: mealPlanLoading } = useQuery({
    queryKey: ["mealPlan", currentWeek],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("User must be authenticated");
      }

      const { data: existingPlan, error: fetchError } = await supabase
        .from("meal_plans")
        .select("*, planned_meals(*, recipes(*))")
        .eq("week_start_date", format(currentWeek, "yyyy-MM-dd"))
        .eq("user_id", session.user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (!existingPlan) {
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({
            week_start_date: format(currentWeek, "yyyy-MM-dd"),
            user_id: session.user.id
          })
          .select("*")
          .single();

        if (createError) throw createError;
        return newPlan;
      }

      return existingPlan;
    },
  });

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
      if (!recipe?.id) {
        throw new Error("Invalid recipe selected");
      }

      const { data: existingMeal, error: findError } = await supabase
        .from("planned_meals")
        .select("id")
        .eq("meal_plan_id", mealPlan?.id)
        .eq("day_of_week", dayOfWeek)
        .eq("meal_type", mealType)
        .maybeSingle();

      if (findError) throw findError;

      if (existingMeal) {
        const { error: updateError } = await supabase
          .from("planned_meals")
          .update({ recipe_id: recipe.id })
          .eq("id", existingMeal.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("planned_meals")
          .insert({
            meal_plan_id: mealPlan?.id,
            recipe_id: recipe.id,
            day_of_week: dayOfWeek,
            meal_type: mealType,
          });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      toast({
        title: "Meal updated",
        description: "The meal has been updated in your plan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update meal. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating meal:", error);
    },
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handlePreviousWeek = () => setCurrentWeek((prev) => addDays(prev, -7));
  const handleNextWeek = () => setCurrentWeek((prev) => addDays(prev, 7));

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
      <WeekNavigation
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onShowShoppingList={() => setShowShoppingList(true)}
      />

      <div className="grid gap-4 md:grid-cols-7">
        {days.map((day, dayIndex) => (
          <DayCard
            key={day.toISOString()}
            day={day}
            dayIndex={dayIndex}
            mealPlan={mealPlan}
            mealTypes={MEAL_TYPES}
            onSelectRecipe={(recipe, dayOfWeek, mealType) => 
              addMealMutation.mutate({ recipe, dayOfWeek, mealType })
            }
          />
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
