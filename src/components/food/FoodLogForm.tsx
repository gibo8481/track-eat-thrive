
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export const FoodLogForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState("Breakfast");
  const [nutritionValues, setNutritionValues] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    vitaminA: "",
    vitaminD: "",
    vitaminK: "",
    vitaminB1: "",
    vitaminB6: "",
    vitaminB12: "",
  });

  const handleNutritionChange = (field: keyof typeof nutritionValues, value: string) => {
    setNutritionValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, create the food item
      const { data: foodItem, error: foodError } = await supabase
        .from("food_items")
        .insert({
          name: foodName,
          serving_size: servingSize,
          calories: parseFloat(nutritionValues.calories),
          protein_g: parseFloat(nutritionValues.protein),
          carbs_g: parseFloat(nutritionValues.carbs),
          fat_g: parseFloat(nutritionValues.fat),
          fiber_g: parseFloat(nutritionValues.fiber),
          vitamin_a_mcg: parseFloat(nutritionValues.vitaminA),
          vitamin_d_mcg: parseFloat(nutritionValues.vitaminD),
          vitamin_k_mcg: parseFloat(nutritionValues.vitaminK),
          vitamin_b1_mg: parseFloat(nutritionValues.vitaminB1),
          vitamin_b6_mg: parseFloat(nutritionValues.vitaminB6),
          vitamin_b12_mcg: parseFloat(nutritionValues.vitaminB12),
        })
        .select()
        .single();

      if (foodError) throw foodError;

      // Then, create the food log entry
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("User not found");

      const { error: logError } = await supabase
        .from("food_logs")
        .insert({
          user_id: profile.user.id,
          food_item_id: foodItem.id,
          servings: parseFloat(servings),
          meal_type: mealType,
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "Food logged successfully",
      });

      // Reset form
      setFoodName("");
      setServingSize("");
      setServings("1");
      setMealType("Breakfast");
      setNutritionValues({
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        vitaminA: "",
        vitaminD: "",
        vitaminK: "",
        vitaminB1: "",
        vitaminB6: "",
        vitaminB12: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log food",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="foodName">Food Name</Label>
          <Input
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servingSize">Serving Size</Label>
          <Input
            id="servingSize"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            required
            placeholder="e.g., 100g"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servings">Number of Servings</Label>
          <Input
            id="servings"
            type="number"
            min="0.25"
            step="0.25"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mealType">Meal Type</Label>
          <Select value={mealType} onValueChange={setMealType}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={nutritionValues.calories}
            onChange={(e) => handleNutritionChange("calories", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            value={nutritionValues.protein}
            onChange={(e) => handleNutritionChange("protein", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            value={nutritionValues.carbs}
            onChange={(e) => handleNutritionChange("carbs", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            value={nutritionValues.fat}
            onChange={(e) => handleNutritionChange("fat", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fiber">Fiber (g)</Label>
          <Input
            id="fiber"
            type="number"
            step="0.1"
            value={nutritionValues.fiber}
            onChange={(e) => handleNutritionChange("fiber", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vitaminA">Vitamin A (mcg)</Label>
          <Input
            id="vitaminA"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminA}
            onChange={(e) => handleNutritionChange("vitaminA", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vitaminD">Vitamin D (mcg)</Label>
          <Input
            id="vitaminD"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminD}
            onChange={(e) => handleNutritionChange("vitaminD", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vitaminK">Vitamin K (mcg)</Label>
          <Input
            id="vitaminK"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminK}
            onChange={(e) => handleNutritionChange("vitaminK", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vitaminB1">Vitamin B1 (mg)</Label>
          <Input
            id="vitaminB1"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminB1}
            onChange={(e) => handleNutritionChange("vitaminB1", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vitaminB6">Vitamin B6 (mg)</Label>
          <Input
            id="vitaminB6"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminB6}
            onChange={(e) => handleNutritionChange("vitaminB6", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vitaminB12">Vitamin B12 (mcg)</Label>
          <Input
            id="vitaminB12"
            type="number"
            step="0.1"
            value={nutritionValues.vitaminB12}
            onChange={(e) => handleNutritionChange("vitaminB12", e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging..." : "Log Food"}
      </Button>
    </form>
  );
};
