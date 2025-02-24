
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Check for deficiencies and get recommendations
    const nutrientChecks = [
      {
        name: 'Vitamin A',
        current: nutrients.total_vitamin_a || 0,
        recommended: dailyRecommended.vitamin_a_mcg,
        searchTerm: 'vitamin+a+rich+foods',
      },
      {
        name: 'Vitamin D',
        current: nutrients.total_vitamin_d || 0,
        recommended: dailyRecommended.vitamin_d_mcg,
        searchTerm: 'vitamin+d+rich+foods',
      },
      {
        name: 'Vitamin K',
        current: nutrients.total_vitamin_k || 0,
        recommended: dailyRecommended.vitamin_k_mcg,
        searchTerm: 'vitamin+k+rich+foods',
      },
      {
        name: 'Vitamin B1',
        current: nutrients.total_vitamin_b1 || 0,
        recommended: dailyRecommended.vitamin_b1_mg,
        searchTerm: 'thiamin+rich+foods',
      },
      {
        name: 'Vitamin B6',
        current: nutrients.total_vitamin_b6 || 0,
        recommended: dailyRecommended.vitamin_b6_mg,
        searchTerm: 'vitamin+b6+rich+foods',
      },
      {
        name: 'Vitamin B12',
        current: nutrients.total_vitamin_b12 || 0,
        recommended: dailyRecommended.vitamin_b12_mcg,
        searchTerm: 'vitamin+b12+rich+foods',
      },
    ];

    for (const check of nutrientChecks) {
      const deficiency = check.recommended - check.current;
      console.log(`Checking ${check.name}: Current=${check.current}, Recommended=${check.recommended}, Deficiency=${deficiency}`);
      
      if (deficiency > 0) {
        console.log(`Finding recommendations for ${check.name} (deficiency: ${deficiency})`);
        
        try {
          // Get recipes high in this nutrient
          const recipesUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${check.searchTerm}&number=3&addRecipeNutrition=true&sort=meta-score&sortDirection=desc`;
          console.log(`Fetching recipes from: ${recipesUrl}`);
          
          const recipesResponse = await fetch(recipesUrl);
          
          if (!recipesResponse.ok) {
            const errorText = await recipesResponse.text();
            console.error(`Spoonacular API error for ${check.name}:`, errorText);
            throw new Error(`Spoonacular API error: ${recipesResponse.statusText}`);
          }

          const recipesData = await recipesResponse.json();
          console.log(`Found ${recipesData.results.length} recipes for ${check.name}`);

          // Get food ingredients high in this nutrient
          const foodsUrl = `https://api.spoonacular.com/food/ingredients/search?apiKey=${SPOONACULAR_API_KEY}&query=${check.searchTerm}&number=5&metaInformation=true`;
          console.log(`Fetching foods from: ${foodsUrl}`);
          
          const foodsResponse = await fetch(foodsUrl);

          if (!foodsResponse.ok) {
            const errorText = await foodsResponse.text();
            console.error(`Failed to get foods for ${check.name}:`, errorText);
            throw new Error(`Failed to get foods: ${foodsResponse.statusText}`);
          }

          const foodsData = await foodsResponse.json();

          if (recipesData.results.length > 0 || foodsData.results.length > 0) {
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
