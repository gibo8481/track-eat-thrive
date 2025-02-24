
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nutrients } = await req.json();
    console.log("Processing nutrients:", JSON.stringify(nutrients, null, 2));

    const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY');
    if (!SPOONACULAR_API_KEY) {
      throw new Error('SPOONACULAR_API_KEY is not configured');
    }

    // Daily recommended values
    const dailyRecommended = {
      vitamin_a_mcg: 900,
      vitamin_d_mcg: 20,
      vitamin_k_mcg: 120,
      vitamin_b1_mg: 1.2,
      vitamin_b6_mg: 1.7,
      vitamin_b12_mcg: 2.4,
    };

    const recommendations = [];
    const deficiencies = [];

    // Calculate deficiencies
    if ((dailyRecommended.vitamin_a_mcg - nutrients.total_vitamin_a) > 0) {
      deficiencies.push({
        nutrient: "Vitamin A",
        searchTerm: "vitamin a rich foods",
        current: nutrients.total_vitamin_a,
        target: dailyRecommended.vitamin_a_mcg
      });
    }
    if ((dailyRecommended.vitamin_d_mcg - nutrients.total_vitamin_d) > 0) {
      deficiencies.push({
        nutrient: "Vitamin D",
        searchTerm: "vitamin d rich foods",
        current: nutrients.total_vitamin_d,
        target: dailyRecommended.vitamin_d_mcg
      });
    }
    if ((dailyRecommended.vitamin_k_mcg - nutrients.total_vitamin_k) > 0) {
      deficiencies.push({
        nutrient: "Vitamin K",
        searchTerm: "vitamin k rich foods",
        current: nutrients.total_vitamin_k,
        target: dailyRecommended.vitamin_k_mcg
      });
    }
    if ((dailyRecommended.vitamin_b1_mg - nutrients.total_vitamin_b1) > 0) {
      deficiencies.push({
        nutrient: "Vitamin B1",
        searchTerm: "thiamin rich foods",
        current: nutrients.total_vitamin_b1,
        target: dailyRecommended.vitamin_b1_mg
      });
    }
    if ((dailyRecommended.vitamin_b6_mg - nutrients.total_vitamin_b6) > 0) {
      deficiencies.push({
        nutrient: "Vitamin B6",
        searchTerm: "vitamin b6 rich foods",
        current: nutrients.total_vitamin_b6,
        target: dailyRecommended.vitamin_b6_mg
      });
    }
    if ((dailyRecommended.vitamin_b12_mcg - nutrients.total_vitamin_b12) > 0) {
      deficiencies.push({
        nutrient: "Vitamin B12",
        searchTerm: "vitamin b12 rich foods",
        current: nutrients.total_vitamin_b12,
        target: dailyRecommended.vitamin_b12_mcg
      });
    }

    console.log("Found deficiencies:", JSON.stringify(deficiencies, null, 2));

    // Get recommendations for each deficiency
    for (const def of deficiencies) {
      try {
        // Get recipes
        const recipeResponse = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(def.searchTerm)}&number=3&addRecipeNutrition=true&sort=rating`
        );

        if (!recipeResponse.ok) {
          throw new Error(`Spoonacular API error: ${recipeResponse.statusText}`);
        }

        const recipeData = await recipeResponse.json();
        console.log(`Found ${recipeData.results.length} recipes for ${def.nutrient}`);

        // Get ingredient suggestions
        const ingredientResponse = await fetch(
          `https://api.spoonacular.com/food/ingredients/search?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(def.searchTerm)}&number=5&metaInformation=true`
        );

        if (!ingredientResponse.ok) {
          throw new Error(`Spoonacular API error: ${ingredientResponse.statusText}`);
        }

        const ingredientData = await ingredientResponse.json();

        recommendations.push({
          nutrient: def.nutrient,
          current: def.current,
          recommended: def.target,
          deficiency: def.target - def.current,
          foods: ingredientData.results.map((food: any) => ({
            name: food.name,
          })),
          recipes: recipeData.results.map((recipe: any) => ({
            id: recipe.id,
            name: recipe.title,
            description: recipe.summary,
            prep_time_minutes: recipe.preparationMinutes || 15,
            cooking_time_minutes: recipe.cookingMinutes || 30,
            rating: recipe.spoonacularScore / 20 || 4.5,
            image: recipe.image,
            sourceUrl: recipe.sourceUrl,
          })),
        });
      } catch (error) {
        console.error(`Error fetching recommendations for ${def.nutrient}:`, error);
      }
    }

    console.log("Sending recommendations:", JSON.stringify(recommendations, null, 2));

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in get-recommendations function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
