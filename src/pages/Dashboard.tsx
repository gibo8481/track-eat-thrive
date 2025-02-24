
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We'll implement nutrition tracking here */}
            <p className="text-sm text-muted-foreground">
              Track your daily nutrition intake
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vitamin Status</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We'll implement vitamin tracking here */}
            <p className="text-sm text-muted-foreground">
              Monitor your vitamin levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We'll implement meal recommendations here */}
            <p className="text-sm text-muted-foreground">
              Get personalized meal suggestions
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
