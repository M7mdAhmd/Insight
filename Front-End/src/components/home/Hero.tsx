import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="" 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-14 md:py-14">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Hard Science
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mt-1 text-6xl pb-2">
              Clear Insights
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your gateway to the latest discoveries and leading researchers
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search papers, authors, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-14 text-lg bg-card border-2 focus-visible:border-primary shadow-card"
              />
              <Button 
                type="submit"
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => navigate("/explore")}>
              <TrendingUp className="h-5 w-5" />
              Explore Trending Papers
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/ai-assistant")}>
              <Sparkles className="h-5 w-5" />
              Try AI Assistant
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t">
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Research Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">12K+</div>
              <div className="text-sm text-muted-foreground">Active Researchers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">200+</div>
              <div className="text-sm text-muted-foreground">Research Fields</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
