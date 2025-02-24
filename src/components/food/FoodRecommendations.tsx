
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export const FoodRecommendations = () => {
  const { data: nutrients } = useQuery({
    queryKey: ["nutrientTotals", new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_nutrient_totals')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", nutrients],
    queryFn: async () => {
      if (!nutrients) return null;
      
      const response = await fetch('/functions/v1/get-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ nutrients })
      });
      
      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    },
    enabled: !!nutrients
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
    <div className="space-y-4">
      {recommendations.recommendations.map((rec: any) => (
        <Card key={rec.nutrient}>
          <CardHeader>
            <CardTitle className="text-lg">{rec.nutrient} Rich Foods</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {rec.foods.map((food: any) => (
                <li key={food.name} className="text-sm">
                  {food.name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
