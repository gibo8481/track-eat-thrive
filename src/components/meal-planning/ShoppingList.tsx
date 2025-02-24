
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShoppingListProps {
  mealPlanId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShoppingList = ({ mealPlanId, open, onOpenChange }: ShoppingListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [splitIntoRuns, setSplitIntoRuns] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: shoppingList, isLoading } = useQuery({
    queryKey: ["shoppingList", mealPlanId],
    queryFn: async () => {
      if (!mealPlanId) return null;

      const { data: list, error: listError } = await supabase
        .from("shopping_lists")
        .select("*, shopping_list_items(*, food_items(*))")
        .eq("meal_plan_id", mealPlanId)
        .maybeSingle();

      if (listError) throw listError;
      return list;
    },
    enabled: !!mealPlanId,
  });

  const generateListMutation = useMutation({
    mutationFn: async () => {
      if (!mealPlanId) return;

      // First, create or update shopping list
      const { data: list, error: listError } = await supabase
        .from("shopping_lists")
        .upsert({
          meal_plan_id: mealPlanId,
          split_into_runs: splitIntoRuns,
        })
        .select("id")
        .single();

      if (listError) throw listError;

      // Get all recipes from meal plan
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from("meal_plans")
        .select("*, planned_meals(*, recipes(*, recipe_ingredients(*, food_items(*))))")
        .eq("id", mealPlanId)
        .maybeSingle();

      if (mealPlanError) throw mealPlanError;
      if (!mealPlan) {
        toast({
          title: "No meal plan found",
          description: "Please create a meal plan first.",
          variant: "destructive",
        });
        return;
      }
      console.log("Meal plan data:", mealPlan);

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("shopping_list_id", list.id);

      if (deleteError) throw deleteError;

      // Generate new items from recipes
      const items = mealPlan.planned_meals?.flatMap((meal: any, index: number) => {
        if (!meal?.recipes?.recipe_ingredients) {
          console.warn("Missing recipe data for meal:", meal);
          return [];
        }
        return meal.recipes.recipe_ingredients.map((ingredient: any) => ({
          shopping_list_id: list.id,
          food_item_id: ingredient.food_item_id,
          amount: ingredient.amount,
          unit: ingredient.unit,
          shopping_run: Math.floor(index / (7 / splitIntoRuns)) + 1,
          purchased: false,
        }));
      }).filter(item => item) || []; // Handle case where planned_meals is null

      if (items.length > 0) {
        console.log("Inserting shopping list items:", items);
        const { error: insertError } = await supabase
          .from("shopping_list_items")
          .insert(items);

        if (insertError) throw insertError;
      } else {
        console.log("No items to insert - meal plan might be empty");
        toast({
          title: "No items to add",
          description: "Add some meals to your plan first.",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] });
      toast({
        title: "Shopping list generated",
        description: "Your shopping list has been updated based on your meal plan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate shopping list. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating shopping list:", error);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, purchased }: { itemId: string; purchased: boolean }) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({ purchased })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] });
    },
  });

  const handleGenerateList = () => {
    setIsGenerating(true);
    generateListMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shopping List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={splitIntoRuns.toString()}
              onValueChange={(value) => setSplitIntoRuns(parseInt(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Shopping runs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single shopping run</SelectItem>
                <SelectItem value="2">Split into 2 runs</SelectItem>
                <SelectItem value="3">Split into 3 runs</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateList}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate List"}
            </Button>
          </div>

          <div className="space-y-6">
            {Array.from({ length: splitIntoRuns }).map((_, runIndex) => (
              <div key={runIndex} className="space-y-2">
                <h4 className="font-medium">
                  {splitIntoRuns > 1
                    ? `Shopping Run ${runIndex + 1}`
                    : "Shopping List"}
                </h4>
                <div className="space-y-2">
                  {shoppingList?.shopping_list_items
                    ?.filter((item: any) => item.shopping_run === runIndex + 1)
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={item.purchased}
                          onCheckedChange={(checked) =>
                            toggleItemMutation.mutate({
                              itemId: item.id,
                              purchased: !!checked,
                            })
                          }
                        />
                        <span className={item.purchased ? "line-through" : ""}>
                          {item.amount} {item.unit} {item.food_items.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
