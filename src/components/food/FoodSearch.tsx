
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface FoodSearchProps {
  foodName: string;
  onFoodNameChange: (name: string) => void;
}

export const FoodSearch = ({ foodName, onFoodNameChange }: FoodSearchProps) => {
  const { toast } = useToast();
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

  return (
    <div className="space-y-2">
      <Label htmlFor="foodName">Food Name</Label>
      <Input
        id="foodName"
        value={foodName}
        onChange={(e) => {
          onFoodNameChange(e.target.value);
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
                onFoodNameChange(food.description);
                setSearchResults([]);
              }}
            >
              {food.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
