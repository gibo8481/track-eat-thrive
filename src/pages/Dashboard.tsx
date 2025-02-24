import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodLogForm } from "@/components/food/FoodLogForm";
import { NutrientSummary } from "@/components/food/NutrientSummary";
import { FoodRecommendations } from "@/components/food/FoodRecommendations";
import { FoodLogHistory } from "@/components/food/FoodLogHistory";
import { WeeklyMealPlan } from "@/components/meal-planning/WeeklyMealPlan";
import { DietPreferences } from "@/components/meal-planning/DietPreferences";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to access the dashboard",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your nutrition, plan meals, and get personalized recommendations.
          </p>
        </div>

        <Tabs defaultValue="tracking" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tracking">Nutrition Tracking</TabsTrigger>
            <TabsTrigger value="planning">Meal Planning</TabsTrigger>
            <TabsTrigger value="preferences">Diet Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Log Food</CardTitle>
                <CardDescription>Record what you've eaten today</CardDescription>
              </CardHeader>
              <CardContent>
                <FoodLogForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Nutrition</CardTitle>
                <CardDescription>Track your macro and micronutrient intake</CardDescription>
              </CardHeader>
              <CardContent>
                <NutrientSummary />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Food Log History</CardTitle>
                <CardDescription>Your recently logged meals</CardDescription>
              </CardHeader>
              <CardContent>
                <FoodLogHistory />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Foods</CardTitle>
                <CardDescription>Based on your nutritional needs</CardDescription>
              </CardHeader>
              <CardContent>
                <FoodRecommendations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Meal Plan</CardTitle>
                <CardDescription>Plan your meals for the week ahead</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyMealPlan />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Diet Preferences</CardTitle>
                <CardDescription>Customize your dietary preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <DietPreferences />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
