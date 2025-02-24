
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

    // Spoonacular uses different units, so we need to convert
    const nutrientChecks = [
      {
        name: 'Vitamin A',
        current: nutrients.total_vitamin_a || 0,
        recommended: dailyRecommended.vitamin_a_mcg,
        nutrientId: 320, // Vitamin A, RAE ID in Spoonacular
      },
      {
        name: 'Vitamin D',
        current: nutrients.total_vitamin_d || 0,
        recommended: dailyRecommended.vitamin_d_mcg,
        nutrientId: 324, // Vitamin D ID in Spoonacular
      },
      {
        name: 'Vitamin K',
        current: nutrients.total_vitamin_k || 0,
        recommended: dailyRecommended.vitamin_k_mcg,
        nutrientId: 430, // Vitamin K ID in Spoonacular
      },
      {
        name: 'Vitamin B1',
        current: nutrients.total_vitamin_b1 || 0,
        recommended: dailyRecommended.vitamin_b1_mg,
        nutrientId: 404, // Thiamin (B1) ID in Spoonacular
      },
      {
        name: 'Vitamin B6',
        current: nutrients.total_vitamin_b6 || 0,
        recommended: dailyRecommended.vitamin_b6_mg,
        nutrientId: 415, // Vitamin B6 ID in Spoonacular
      },
      {
        name: 'Vitamin B12',
        current: nutrients.total_vitamin_b12 || 0,
        recommended: dailyRecommended.vitamin_b12_mcg,
        nutrientId: 418, // Vitamin B12 ID in Spoonacular
      },
    ];

    for (const check of nutrientChecks) {
      const deficiency = check.recommended - check.current;
      console.log(`Checking ${check.name}: Current=${check.current}, Recommended=${check.recommended}, Deficiency=${deficiency}`);
      
      if (deficiency > 0) {
        console.log(`Finding recommendations for ${check.name} (deficiency: ${deficiency})`);
        
        try {
          // Get recipes high in this nutrient using the nutrients endpoint
          const recipesUrl = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${SPOONACULAR_API_KEY}&minAmount=20&number=3&nutrients=${check.name.toLowerCase().replace(' ', '')}`;
          console.log(`Fetching recipes from: ${recipesUrl}`);
          
          const recipesResponse = await fetch(recipesUrl);
          
          if (!recipesResponse.ok) {
            const errorText = await recipesResponse.text();
            console.error(`Spoonacular API error for ${check.name}:`, errorText);
            throw new Error(`Spoonacular API error: ${recipesResponse.statusText}`);
          }

          const recipes = await recipesResponse.json();
          console.log(`Found ${recipes.length} recipes for ${check.name}`);

          // Get recipe details including instructions and nutrition
          const detailedRecipes = await Promise.all(
            recipes.map(async (recipe: any) => {
              const detailUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`;
              const response = await fetch(detailUrl);
              if (!response.ok) {
                throw new Error(`Failed to get recipe details: ${response.statusText}`);
              }
              return response.json();
            })
          );

          // Get foods high in this nutrient
          const foodsUrl = `https://api.spoonacular.com/food/ingredients/search?apiKey=${SPOONACULAR_API_KEY}&query=high+in+${check.name.toLowerCase().replace(' ', '+')}&number=5&metaInformation=true`;
          console.log(`Fetching foods from: ${foodsUrl}`);
          
          const foodsResponse = await fetch(foodsUrl);

          if (!foodsResponse.ok) {
            const errorText = await foodsResponse.text();
            console.error(`Failed to get foods for ${check.name}:`, errorText);
            throw new Error(`Failed to get foods: ${foodsResponse.statusText}`);
          }

          const foodsData = await foodsResponse.json();

          if (detailedRecipes.length > 0 || foodsData.results.length > 0) {
            recommendations.push({
              nutrient: check.name,
              current: check.current,
              recommended: check.recommended,
              deficiency: deficiency,
              foods: foodsData.results.map((food: any) => ({
                name: food.name,
              })),
              recipes: detailedRecipes.map((recipe: any) => ({
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
          }
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
