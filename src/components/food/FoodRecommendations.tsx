
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink } from "lucide-react";
import { AlertCircle } from "lucide-react";

export const FoodRecommendations = () => {
  const { data: nutrients } = useQuery({
    queryKey: ["nutrientTotals", new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_nutrient_totals')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        total_vitamin_a: 0,
        total_vitamin_d: 0,
        total_vitamin_k: 0,
        total_vitamin_b1: 0,
        total_vitamin_b6: 0,
        total_vitamin_b12: 0,
      };
    }
  });

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ["recommendations", nutrients],
    queryFn: async () => {
      if (!nutrients) return null;
      
      console.log("Fetching recommendations with nutrients:", nutrients);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ nutrients })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get recommendations: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received recommendations:", data);
      return data;
    },
    enabled: !!nutrients,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load recommendations: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations?.recommendations?.length) {
    return (
      <Alert>
        <AlertTitle>Great job!</AlertTitle>
        <AlertDescription>
          You're meeting all your nutritional requirements for today.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.recommendations.map((rec: any) => (
        <Card key={rec.nutrient}>
          <CardHeader>
            <CardTitle className="text-lg">
              {rec.nutrient} Rich Foods & Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Nutrient-Rich Ingredients:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {rec.foods.map((food: any) => (
                    <li key={food.name} className="text-sm">
                      {food.name}
                    </li>
                  ))}
                </ul>
              </div>
              
              {rec.recipes && rec.recipes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommended Recipes:</h4>
                  <div className="space-y-3">
                    {rec.recipes.map((recipe: any) => (
                      <div
                        key={recipe.id}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <div className="flex gap-4">
                          {recipe.image && (
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="w-24 h-24 object-cover rounded-md"
                            />
                          )}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-medium">{recipe.name}</h5>
                              {recipe.sourceUrl && (
                                <a
                                  href={recipe.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                            {recipe.description && (
                              <p 
                                className="text-sm text-muted-foreground"
                                dangerouslySetInnerHTML={{ 
                                  __html: recipe.description.substring(0, 150) + '...'
                                }}
                              />
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {recipe.prep_time_minutes + recipe.cooking_time_minutes} min
                              </span>
                              <span>•</span>
                              <span>{recipe.rating.toFixed(1)}⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
