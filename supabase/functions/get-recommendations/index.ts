
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Check each nutrient and find food recommendations if deficient
    const nutrientChecks = [
      {
        name: 'Vitamin A',
        current: nutrients.total_vitamin_a || 0,
        recommended: dailyRecommended.vitamin_a_mcg,
        spoonacularName: 'Vitamin A',
      },
      {
        name: 'Vitamin D',
        current: nutrients.total_vitamin_d || 0,
        recommended: dailyRecommended.vitamin_d_mcg,
        spoonacularName: 'Vitamin D',
      },
      {
        name: 'Vitamin K',
        current: nutrients.total_vitamin_k || 0,
        recommended: dailyRecommended.vitamin_k_mcg,
        spoonacularName: 'Vitamin K',
      },
      {
        name: 'Vitamin B1',
        current: nutrients.total_vitamin_b1 || 0,
        recommended: dailyRecommended.vitamin_b1_mg,
        spoonacularName: 'Vitamin B1',
      },
      {
        name: 'Vitamin B6',
        current: nutrients.total_vitamin_b6 || 0,
        recommended: dailyRecommended.vitamin_b6_mg,
        spoonacularName: 'Vitamin B6',
      },
      {
        name: 'Vitamin B12',
        current: nutrients.total_vitamin_b12 || 0,
        recommended: dailyRecommended.vitamin_b12_mcg,
        spoonacularName: 'Vitamin B12',
      },
    ];

    // Check each nutrient and get recommendations if needed
    for (const check of nutrientChecks) {
      if (check.current < check.recommended) {
        console.log(`Finding recommendations for ${check.name}`);
        
        try {
          // First get recipes rich in this nutrient
          const recipesResponse = await fetch(
            `https://api.spoonacular.com/recipes/findByNutrients?min${check.spoonacularName}Percent=50&number=3&apiKey=${SPOONACULAR_API_KEY}`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (!recipesResponse.ok) {
            throw new Error(`Spoonacular API error: ${recipesResponse.statusText}`);
          }

          const recipes = await recipesResponse.json();
          console.log(`Found ${recipes.length} recipes for ${check.name}`);

          // Get detailed recipe information including preparation time
          const detailedRecipes = await Promise.all(
            recipes.map(async (recipe: any) => {
              const detailResponse = await fetch(
                `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`,
                { headers: { 'Content-Type': 'application/json' } }
              );
              
              if (!detailResponse.ok) {
                throw new Error(`Failed to get recipe details: ${detailResponse.statusText}`);
              }

              return detailResponse.json();
            })
          );

          // Get nutrient-rich foods
          const foodsResponse = await fetch(
            `https://api.spoonacular.com/food/ingredients/search?query=${check.spoonacularName}&number=5&apiKey=${SPOONACULAR_API_KEY}`,
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (!foodsResponse.ok) {
            throw new Error(`Failed to get foods: ${foodsResponse.statusText}`);
          }

          const foods = await foodsResponse.json();

          recommendations.push({
            nutrient: check.name,
            current: check.current,
            recommended: check.recommended,
            deficiency: check.recommended - check.current,
            foods: foods.results.map((food: any) => ({
              name: food.name,
              amount: food.nutrition?.nutrients?.find((n: any) => n.name === check.spoonacularName)?.amount || 0,
            })),
            recipes: detailedRecipes.map((recipe: any) => ({
              id: recipe.id,
              name: recipe.title,
              description: recipe.summary,
              prep_time_minutes: recipe.preparationMinutes || 15,
              cooking_time_minutes: recipe.cookingMinutes || 30,
              rating: recipe.spoonacularScore / 20, // Convert to 5-star scale
              image: recipe.image,
              sourceUrl: recipe.sourceUrl,
            })),
          });
        } catch (error) {
          console.error(`Error fetching ${check.name} recommendations:`, error);
        }
      }
    }

    console.log("Sending recommendations:", recommendations);

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
