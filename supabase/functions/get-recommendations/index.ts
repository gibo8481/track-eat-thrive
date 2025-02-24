
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

    // Helper function to fetch recipes and ingredients
    async function getRecommendationsForNutrient(nutrient, searchTerm, current, target) {
      // Get recipes
      const recipeUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(searchTerm)}&number=3&addRecipeNutrition=true&sort=meta-score`;
      console.log(`Fetching recipes for ${nutrient} from: ${recipeUrl}`);
      
      const recipeResponse = await fetch(recipeUrl);
      if (!recipeResponse.ok) {
        const errorText = await recipeResponse.text();
        console.error(`Spoonacular recipe API error for ${nutrient}:`, errorText);
        throw new Error(`Spoonacular API error: ${recipeResponse.status} ${errorText}`);
      }

      const recipeData = await recipeResponse.json();
      console.log(`Found ${recipeData.results?.length || 0} recipes for ${nutrient}`);

      // Get ingredient suggestions
      const ingredientUrl = `https://api.spoonacular.com/food/ingredients/search?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(searchTerm)}&number=5&metaInformation=true`;
      console.log(`Fetching ingredients for ${nutrient} from: ${ingredientUrl}`);
      
      const ingredientResponse = await fetch(ingredientUrl);
      if (!ingredientResponse.ok) {
        const errorText = await ingredientResponse.text();
        console.error(`Spoonacular ingredient API error for ${nutrient}:`, errorText);
        throw new Error(`Spoonacular API error: ${ingredientResponse.status} ${errorText}`);
      }

      const ingredientData = await ingredientResponse.json();
      console.log(`Found ${ingredientData.results?.length || 0} ingredients for ${nutrient}`);

      return {
        nutrient,
        current,
        recommended: target,
        deficiency: target - current,
        foods: ingredientData.results?.map(food => ({
          name: food.name,
        })) || [],
        recipes: recipeData.results?.map(recipe => ({
          id: recipe.id,
          name: recipe.title,
          description: recipe.summary,
          prep_time_minutes: recipe.preparationMinutes || 15,
          cooking_time_minutes: recipe.cookingMinutes || 30,
          rating: recipe.spoonacularScore / 20 || 4.5,
          image: recipe.image,
          sourceUrl: recipe.sourceUrl,
        })) || [],
      };
    }

    // Check each nutrient and get recommendations if deficient
    if ((dailyRecommended.vitamin_a_mcg - nutrients.total_vitamin_a) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin A",
          "vitamin a rich foods carrots sweet potatoes",
          nutrients.total_vitamin_a,
          dailyRecommended.vitamin_a_mcg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin A recommendations:", error);
      }
    }

    if ((dailyRecommended.vitamin_d_mcg - nutrients.total_vitamin_d) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin D",
          "vitamin d rich foods salmon mushrooms",
          nutrients.total_vitamin_d,
          dailyRecommended.vitamin_d_mcg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin D recommendations:", error);
      }
    }

    if ((dailyRecommended.vitamin_k_mcg - nutrients.total_vitamin_k) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin K",
          "vitamin k rich foods kale spinach",
          nutrients.total_vitamin_k,
          dailyRecommended.vitamin_k_mcg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin K recommendations:", error);
      }
    }

    if ((dailyRecommended.vitamin_b1_mg - nutrients.total_vitamin_b1) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin B1",
          "thiamin rich foods whole grains legumes",
          nutrients.total_vitamin_b1,
          dailyRecommended.vitamin_b1_mg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin B1 recommendations:", error);
      }
    }

    if ((dailyRecommended.vitamin_b6_mg - nutrients.total_vitamin_b6) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin B6",
          "vitamin b6 rich foods chickpeas banana",
          nutrients.total_vitamin_b6,
          dailyRecommended.vitamin_b6_mg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin B6 recommendations:", error);
      }
    }

    if ((dailyRecommended.vitamin_b12_mcg - nutrients.total_vitamin_b12) > 0) {
      try {
        const rec = await getRecommendationsForNutrient(
          "Vitamin B12",
          "vitamin b12 rich foods beef eggs",
          nutrients.total_vitamin_b12,
          dailyRecommended.vitamin_b12_mcg
        );
        recommendations.push(rec);
      } catch (error) {
        console.error("Error getting Vitamin B12 recommendations:", error);
      }
    }

    console.log("Generated recommendations:", JSON.stringify(recommendations, null, 2));

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
