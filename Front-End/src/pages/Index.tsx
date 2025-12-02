import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import TrendingPapers from "@/components/home/TrendingPapers";
import FeaturedFields from "@/components/home/FeaturedFields";
import AIAssistantBanner from "@/components/home/AIAssistantBanner";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <TrendingPapers />
      <AIAssistantBanner />
      <FeaturedFields />
    </MainLayout>
  );
};

export default Index;
