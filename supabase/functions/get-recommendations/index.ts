
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nutrients } = await req.json();
    console.log("Received nutrients:", nutrients);

    if (!SPOONACULAR_API_KEY) {
      throw new Error('Spoonacular API key is not configured');
    }

    const recommendations = [];

    // Define daily recommended values
    const dailyRecommended = {
      vitamin_a_mcg: 900,
      vitamin_d_mcg: 20,
      vitamin_k_mcg: 120,
      vitamin_b1_mg: 1.2,
      vitamin_b6_mg: 1.7,
      vitamin_b12_mcg: 2.4,
    };

    // Mapping of nutrient names to Spoonacular parameter names
    const spoonacularNutrientMap = {
      'Vitamin A': 'vitaminA',
      'Vitamin D': 'vitaminD',
      'Vitamin K': 'vitaminK',
      'Vitamin B1': 'vitaminB1',
      'Vitamin B6': 'vitaminB6',
      'Vitamin B12': 'vitaminB12'
    };

    // Check each nutrient and find food recommendations if deficient
    const nutrientChecks = [
      {
        name: 'Vitamin A',
        current: nutrients.total_vitamin_a || 0,
        recommended: dailyRecommended.vitamin_a_mcg,
        spoonacularName: 'vitaminA',
      },
      {
        name: 'Vitamin D',
        current: nutrients.total_vitamin_d || 0,
        recommended: dailyRecommended.vitamin_d_mcg,
        spoonacularName: 'vitaminD',
      },
      {
        name: 'Vitamin K',
        current: nutrients.total_vitamin_k || 0,
        recommended: dailyRecommended.vitamin_k_mcg,
        spoonacularName: 'vitaminK',
      },
      {
        name: 'Vitamin B1',
        current: nutrients.total_vitamin_b1 || 0,
        recommended: dailyRecommended.vitamin_b1_mg,
        spoonacularName: 'vitaminB1',
      },
      {
        name: 'Vitamin B6',
        current: nutrients.total_vitamin_b6 || 0,
        recommended: dailyRecommended.vitamin_b6_mg,
        spoonacularName: 'vitaminB6',
      },
      {
        name: 'Vitamin B12',
        current: nutrients.total_vitamin_b12 || 0,
        recommended: dailyRecommended.vitamin_b12_mcg,
        spoonacularName: 'vitaminB12',
      },
    ];

    // Check each nutrient and get recommendations if needed
    for (const check of nutrientChecks) {
      const deficiency = check.recommended - check.current;
      console.log(`Checking ${check.name}: Current=${check.current}, Recommended=${check.recommended}, Deficiency=${deficiency}`);
      
      if (deficiency > 0) {
        console.log(`Finding recommendations for ${check.name} (deficiency: ${deficiency})`);
        
        try {
          // First get recipes rich in this nutrient
          const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=3&addRecipeNutrition=true&sort=max${check.spoonacularName}&sortDirection=desc`;
          console.log(`Fetching recipes from: ${searchUrl}`);
          
          const recipesResponse = await fetch(searchUrl);
          
          if (!recipesResponse.ok) {
            const errorText = await recipesResponse.text();
            console.error(`Spoonacular API error for ${check.name}:`, errorText);
            throw new Error(`Spoonacular API error: ${recipesResponse.statusText}`);
          }

          const recipesData = await recipesResponse.json();
          console.log(`Found ${recipesData.results.length} recipes for ${check.name}`);

          // Get nutrient-rich foods
          const foodsUrl = `https://api.spoonacular.com/food/ingredients/search?query=${check.name}&number=5&apiKey=${SPOONACULAR_API_KEY}`;
          console.log(`Fetching foods from: ${foodsUrl}`);
          
          const foodsResponse = await fetch(foodsUrl);

          if (!foodsResponse.ok) {
            const errorText = await foodsResponse.text();
            console.error(`Failed to get foods for ${check.name}:`, errorText);
            throw new Error(`Failed to get foods: ${foodsResponse.statusText}`);
          }

          const foodsData = await foodsResponse.json();

          recommendations.push({
            nutrient: check.name,
            current: check.current,
            recommended: check.recommended,
            deficiency: deficiency,
            foods: foodsData.results.map((food: any) => ({
              name: food.name,
            })),
            recipes: recipesData.results.map((recipe: any) => ({
              id: recipe.id,
              name: recipe.title,
              description: recipe.summary,
              prep_time_minutes: recipe.preparationMinutes || 15,
              cooking_time_minutes: recipe.cookingMinutes || 30,
              rating: recipe.spoonacularScore / 20,
              image: recipe.image,
              sourceUrl: recipe.sourceUrl,
            })),
          });
        } catch (error) {
          console.error(`Error fetching ${check.name} recommendations:`, error);
        }
      }
    }

    console.log("Final recommendations:", recommendations);

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
