
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
        column: 'vitamin_a_mcg',
      },
      {
        name: 'Vitamin D',
        current: nutrients.total_vitamin_d || 0,
        recommended: dailyRecommended.vitamin_d_mcg,
        column: 'vitamin_d_mcg',
      },
      {
        name: 'Vitamin K',
        current: nutrients.total_vitamin_k || 0,
        recommended: dailyRecommended.vitamin_k_mcg,
        column: 'vitamin_k_mcg',
      },
      {
        name: 'Vitamin B1',
        current: nutrients.total_vitamin_b1 || 0,
        recommended: dailyRecommended.vitamin_b1_mg,
        column: 'vitamin_b1_mg',
      },
      {
        name: 'Vitamin B6',
        current: nutrients.total_vitamin_b6 || 0,
        recommended: dailyRecommended.vitamin_b6_mg,
        column: 'vitamin_b6_mg',
      },
      {
        name: 'Vitamin B12',
        current: nutrients.total_vitamin_b12 || 0,
        recommended: dailyRecommended.vitamin_b12_mcg,
        column: 'vitamin_b12_mcg',
      },
    ];

    // Check each nutrient and get recommendations if needed
    for (const check of nutrientChecks) {
      if (check.current < check.recommended) {
        console.log(`Finding recommendations for ${check.name}`);
        
        // First get nutrient-rich ingredients
        const { data: foods } = await supabaseClient
          .from('food_items')
          .select('id, name, ' + check.column)
          .order(check.column, { ascending: false })
          .limit(5);

        if (foods && foods.length > 0) {
          // Then find recipes containing these ingredients
          const foodIds = foods.map((food: any) => food.id);
          const { data: recipes } = await supabaseClient
            .from('recipes')
            .select(`
              id,
              name,
              description,
              cooking_time_minutes,
              prep_time_minutes,
              rating,
              recipe_ingredients!inner(food_item_id)
            `)
            .in('recipe_ingredients.food_item_id', foodIds)
            .order('rating', { ascending: false })
            .limit(3);

          recommendations.push({
            nutrient: check.name,
            current: check.current,
            recommended: check.recommended,
            deficiency: check.recommended - check.current,
            foods: foods.map((food: any) => ({
              name: food.name,
              amount: food[check.column],
            })),
            recipes: recipes || [],
          });
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
