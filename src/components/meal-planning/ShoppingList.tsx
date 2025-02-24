
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
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

  const { data: shoppingList } = useQuery({
    queryKey: ["shoppingList", mealPlanId],
    queryFn: async () => {
      if (!mealPlanId) return null;

      const { data: list, error: listError } = await supabase
        .from("shopping_lists")
        .select("*, shopping_list_items(*, food_items(*))")
        .eq("meal_plan_id", mealPlanId)
        .single();

      if (listError && listError.code !== "PGRST116") throw listError;

      if (!list) {
        // Create new shopping list
        const { data: newList, error: createError } = await supabase
          .from("shopping_lists")
          .insert({ meal_plan_id: mealPlanId, split_into_runs: splitIntoRuns })
          .select("*")
          .single();

        if (createError) throw createError;
        return newList;
      }

      return list;
    },
    enabled: !!mealPlanId,
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
