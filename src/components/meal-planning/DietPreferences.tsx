
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIET_TYPES = [
  { value: "classic", label: "Classic" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "flexitarian", label: "Flexitarian" },
];

export const DietPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maxTime, setMaxTime] = useState("");
  const [maxIngredients, setMaxIngredients] = useState("");

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["dietPreferences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_preferences")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("diet_preferences")
        .upsert(values);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPreferences"] });
      toast({
        title: "Preferences updated",
        description: "Your diet preferences have been saved.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      diet_type: preferences?.diet_type || "classic",
      max_cooking_time: parseInt(maxTime) || preferences?.max_cooking_time,
      max_ingredients: parseInt(maxIngredients) || preferences?.max_ingredients,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="diet-type">Diet Type</Label>
          <Select
            value={preferences?.diet_type || "classic"}
            onValueChange={(value) =>
              mutation.mutate({ ...preferences, diet_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a diet type" />
            </SelectTrigger>
            <SelectContent>
              {DIET_TYPES.map((diet) => (
                <SelectItem key={diet.value} value={diet.value}>
                  {diet.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-time">Maximum Cooking Time (minutes)</Label>
          <Input
            id="max-time"
            type="number"
            placeholder={preferences?.max_cooking_time?.toString() || "60"}
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-ingredients">Maximum Number of Ingredients</Label>
          <Input
            id="max-ingredients"
            type="number"
            placeholder={preferences?.max_ingredients?.toString() || "10"}
            value={maxIngredients}
            onChange={(e) => setMaxIngredients(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit">Save Preferences</Button>
    </form>
  );
};
