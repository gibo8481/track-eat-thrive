
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodLogForm } from "@/components/food/FoodLogForm";
import { NutrientSummary } from "@/components/food/NutrientSummary";
import { FoodRecommendations } from "@/components/food/FoodRecommendations";

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
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Log Food</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLogForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <NutrientSummary />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Foods</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodRecommendations />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
