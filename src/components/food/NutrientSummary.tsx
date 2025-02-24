
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Daily recommended values (in the same units as our database)
const DAILY_RECOMMENDED = {
  calories: 2000,
  protein_g: 50,
  carbs_g: 275,
  fat_g: 78,
  fiber_g: 28,
  vitamin_a_mcg: 900,
  vitamin_d_mcg: 20,
  vitamin_k_mcg: 120,
  vitamin_b1_mg: 1.2,
  vitamin_b6_mg: 1.7,
  vitamin_b12_mcg: 2.4,
};

export const NutrientSummary = () => {
  const { data: nutrients, isLoading } = useQuery({
    queryKey: ["nutrientTotals", new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_nutrient_totals')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error) throw error;
      return data || {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        total_vitamin_a: 0,
        total_vitamin_d: 0,
        total_vitamin_k: 0,
        total_vitamin_b1: 0,
        total_vitamin_b6: 0,
        total_vitamin_b12: 0,
      };
    }
  });

  if (isLoading) {
    return <div>Loading nutrient data...</div>;
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Calories</span>
              <span>{nutrients.total_calories?.toFixed(0)} / {DAILY_RECOMMENDED.calories}</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_calories || 0, DAILY_RECOMMENDED.calories)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Protein</span>
              <span>{nutrients.total_protein?.toFixed(1)}g / {DAILY_RECOMMENDED.protein_g}g</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_protein || 0, DAILY_RECOMMENDED.protein_g)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Carbs</span>
              <span>{nutrients.total_carbs?.toFixed(1)}g / {DAILY_RECOMMENDED.carbs_g}g</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_carbs || 0, DAILY_RECOMMENDED.carbs_g)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fat</span>
              <span>{nutrients.total_fat?.toFixed(1)}g / {DAILY_RECOMMENDED.fat_g}g</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_fat || 0, DAILY_RECOMMENDED.fat_g)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>B Vitamins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>B1 (Thiamin)</span>
              <span>{nutrients.total_vitamin_b1?.toFixed(1)}mg / {DAILY_RECOMMENDED.vitamin_b1_mg}mg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_b1 || 0, DAILY_RECOMMENDED.vitamin_b1_mg)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>B6</span>
              <span>{nutrients.total_vitamin_b6?.toFixed(1)}mg / {DAILY_RECOMMENDED.vitamin_b6_mg}mg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_b6 || 0, DAILY_RECOMMENDED.vitamin_b6_mg)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>B12</span>
              <span>{nutrients.total_vitamin_b12?.toFixed(1)}mcg / {DAILY_RECOMMENDED.vitamin_b12_mcg}mcg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_b12 || 0, DAILY_RECOMMENDED.vitamin_b12_mcg)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Vitamins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vitamin A</span>
              <span>{nutrients.total_vitamin_a?.toFixed(0)}mcg / {DAILY_RECOMMENDED.vitamin_a_mcg}mcg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_a || 0, DAILY_RECOMMENDED.vitamin_a_mcg)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vitamin D</span>
              <span>{nutrients.total_vitamin_d?.toFixed(1)}mcg / {DAILY_RECOMMENDED.vitamin_d_mcg}mcg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_d || 0, DAILY_RECOMMENDED.vitamin_d_mcg)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vitamin K</span>
              <span>{nutrients.total_vitamin_k?.toFixed(0)}mcg / {DAILY_RECOMMENDED.vitamin_k_mcg}mcg</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_vitamin_k || 0, DAILY_RECOMMENDED.vitamin_k_mcg)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fiber</span>
              <span>{nutrients.total_fiber?.toFixed(1)}g / {DAILY_RECOMMENDED.fiber_g}g</span>
            </div>
            <Progress value={calculateProgress(nutrients.total_fiber || 0, DAILY_RECOMMENDED.fiber_g)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
