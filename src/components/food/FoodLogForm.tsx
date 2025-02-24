
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
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchFood = async (query: string) => {
    if (!query) return;
    
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
          query
        )}&pageSize=5&api_key=QDt4XRlkOQTS2fzVdXuT5m651xPwOgj4ew8WC3Xo`
      );
      const data = await response.json();
      setSearchResults(data.foods || []);
    } catch (error) {
      console.error("Failed to search foods:", error);
      toast({
        title: "Error",
        description: "Failed to search for food items",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get nutritional information from the API
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
          foodName
        )}&pageSize=1&api_key=QDt4XRlkOQTS2fzVdXuT5m651xPwOgj4ew8WC3Xo`
      );
      const data = await response.json();
      
      if (!data.foods || data.foods.length === 0) {
        throw new Error("No nutritional information found for this food");
      }

      const foodInfo = data.foods[0];
      const nutrients = foodInfo.foodNutrients;

      // Helper function to find nutrient value
      const getNutrientValue = (nutrientName: string) => {
        const nutrient = nutrients.find((n: any) => 
          n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
        );
        return nutrient ? nutrient.value : 0;
      };

      // Create the food item with fetched nutritional data
      const { data: foodItem, error: foodError } = await supabase
        .from("food_items")
        .insert({
          name: foodName,
          serving_size: servingSize,
          calories: getNutrientValue("Energy"),
          protein_g: getNutrientValue("Protein"),
          carbs_g: getNutrientValue("Carbohydrate"),
          fat_g: getNutrientValue("Total lipid (fat)"),
          fiber_g: getNutrientValue("Fiber"),
          vitamin_a_mcg: getNutrientValue("Vitamin A"),
          vitamin_d_mcg: getNutrientValue("Vitamin D"),
          vitamin_k_mcg: getNutrientValue("Vitamin K"),
          vitamin_b1_mg: getNutrientValue("Thiamin"),
          vitamin_b6_mg: getNutrientValue("Vitamin B-6"),
          vitamin_b12_mcg: getNutrientValue("Vitamin B-12"),
        })
        .select()
        .single();

      if (foodError) throw foodError;

      // Create the food log entry
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
      setSearchResults([]);
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
            onChange={(e) => {
              setFoodName(e.target.value);
              searchFood(e.target.value);
            }}
            required
          />
          {searchResults.length > 0 && (
            <div className="mt-2 p-2 bg-background border rounded-md shadow-sm">
              {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  type="button"
                  className="w-full text-left p-2 hover:bg-accent rounded-sm text-sm"
                  onClick={() => {
                    setFoodName(food.description);
                    setSearchResults([]);
                  }}
                >
                  {food.description}
                </button>
              ))}
            </div>
          )}
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging..." : "Log Food"}
      </Button>
    </form>
  );
};
