
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { FoodSearch } from "./FoodSearch";
import { ServingInput } from "./ServingInput";
import { MealTypeSelect } from "./MealTypeSelect";

export const FoodLogForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState("Breakfast");

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
        <FoodSearch 
          foodName={foodName} 
          onFoodNameChange={setFoodName} 
        />
        <ServingInput
          servingSize={servingSize}
          servings={servings}
          onServingSizeChange={setServingSize}
          onServingsChange={setServings}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MealTypeSelect 
          mealType={mealType} 
          onMealTypeChange={setMealType} 
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging..." : "Log Food"}
      </Button>
    </form>
  );
};
