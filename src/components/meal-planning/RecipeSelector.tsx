
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RecipeSelectorProps {
  onSelect: (recipe: any) => void;
  trigger?: React.ReactNode;
}

export const RecipeSelector = ({ onSelect, trigger }: RecipeSelectorProps) => {
  const { toast } = useToast();
  
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data: recipes, error } = await supabase
        .from("recipes")
        .select("*")
        .order("rating", { ascending: false });

      if (error) {
        console.error("Error fetching recipes:", error);
        throw error;
      }

      if (!recipes || recipes.length === 0) {
        // Let's create some sample recipes
        const sampleRecipes = [
          {
            name: "Spaghetti Bolognese",
            prep_time_minutes: 15,
            cooking_time_minutes: 30,
            rating: 4.5,
            review_count: 120,
            instructions: "1. Cook pasta\n2. Make sauce\n3. Combine"
          },
          {
            name: "Grilled Chicken Salad",
            prep_time_minutes: 20,
            cooking_time_minutes: 15,
            rating: 4.3,
            review_count: 85,
            instructions: "1. Grill chicken\n2. Prepare vegetables\n3. Toss salad"
          },
          {
            name: "Vegetable Stir Fry",
            prep_time_minutes: 15,
            cooking_time_minutes: 10,
            rating: 4.4,
            review_count: 95,
            instructions: "1. Chop vegetables\n2. Heat wok\n3. Stir fry"
          }
        ];

        const { error: insertError } = await supabase
          .from("recipes")
          .insert(sampleRecipes);

        if (insertError) {
          console.error("Error inserting sample recipes:", insertError);
          throw insertError;
        }

        return sampleRecipes;
      }

      return recipes;
    },
  });

  if (error) {
    toast({
      title: "Error loading recipes",
      description: "Failed to load recipes. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Select Recipe</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Recipe</DialogTitle>
          <DialogDescription>
            Select a recipe to add to your meal plan.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search recipes..." />
          <CommandList>
            <CommandEmpty>No recipes found.</CommandEmpty>
            <CommandGroup>
              {recipes?.map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  onSelect={() => {
                    onSelect(recipe);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{recipe.name}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prep_time_minutes + recipe.cooking_time_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {recipe.rating} ({recipe.review_count})
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
