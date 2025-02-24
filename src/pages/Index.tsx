
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Leaf, Heart, Salad } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center space-y-6 animate-fade-in">
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-tight">
              Track Your Nutrition,
              <br /> Transform Your Health
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personal nutrition companion for balanced, healthy living. Track nutrients, plan meals, and achieve your wellness goals.
            </p>
            <Button
              size="lg"
              className="mt-8 text-lg"
              onClick={() => navigate("/setup")}
            >
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8 animate-slide-up">
            <FeatureCard
              icon={<Leaf className="h-8 w-8 text-primary" />}
              title="Nutrient Tracking"
              description="Monitor your daily intake of essential vitamins and minerals with precision."
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8 text-primary" />}
              title="Personalized Plans"
              description="Get meal recommendations tailored to your nutritional needs and preferences."
            />
            <FeatureCard
              icon={<Salad className="h-8 w-8 text-primary" />}
              title="Meal Planning"
              description="Plan your weekly meals and generate smart shopping lists automatically."
            />
          </section>

          {/* Call to Action */}
          <section className="text-center space-y-6 animate-slide-up">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their relationship with food and nutrition.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-4"
              onClick={() => navigate("/setup")}
            >
              Create Your Profile <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="p-6 space-y-4 text-center hover:shadow-lg transition-shadow duration-300">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
      {icon}
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

export default Index;
