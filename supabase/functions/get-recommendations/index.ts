
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const USDA_API_KEY = Deno.env.get("USDA_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nutrients } = await req.json();
    const deficientNutrients = [];

    // Check for nutrient deficiencies
    if (nutrients.total_vitamin_a < 900) deficientNutrients.push('Vitamin A');
    if (nutrients.total_vitamin_d < 20) deficientNutrients.push('Vitamin D');
    if (nutrients.total_vitamin_k < 120) deficientNutrients.push('Vitamin K');
    if (nutrients.total_vitamin_b1 < 1.2) deficientNutrients.push('Vitamin B1');
    if (nutrients.total_vitamin_b6 < 1.7) deficientNutrients.push('Vitamin B6');
    if (nutrients.total_vitamin_b12 < 2.4) deficientNutrients.push('Vitamin B12');

    // Query USDA API for foods rich in deficient nutrients
    const recommendations = [];
    for (const nutrient of deficientNutrients) {
      const query = encodeURIComponent(`${nutrient} rich foods`);
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${query}&pageSize=5`
      );
      const data = await response.json();
      recommendations.push({
        nutrient,
        foods: data.foods.map((food: any) => ({
          name: food.description,
          nutrients: food.foodNutrients
        }))
      });
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
