import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIAssistantBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="relative overflow-hidden bg-gradient-hero border-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        
        <div className="relative p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Powered by Advanced AI
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Your Intelligent Research Companion
            </h2>

            <p className="text-lg text-white/90 leading-relaxed">
              Get personalized paper recommendations, instant explanations of complex concepts, 
              and insights tailored to your research interests. Let AI accelerate your discovery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/ai-assistant")}
              >
                <MessageSquare className="h-5 w-5" />
                Start Conversation
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold">Smart</div>
                <div className="text-sm text-white/80">Recommendations</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Instant</div>
                <div className="text-sm text-white/80">Explanations</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Available</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AIAssistantBanner;
