
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Star } from "lucide-react";

interface RecipeSelectorProps {
  onSelect: (recipe: any) => void;
  trigger?: React.ReactNode;
}

export const RecipeSelector = ({ onSelect, trigger }: RecipeSelectorProps) => {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Select Recipe</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Recipe</DialogTitle>
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
