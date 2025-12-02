import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, TrendingUp, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - will be replaced with API
const trendingPapers = [
  {
    id: 1,
    title: "Advances in Neural Architecture Search for Computer Vision",
    abstract: "This paper presents novel techniques for automated neural architecture search...",
    authors: ["Dr. Sarah Chen", "Prof. Michael Roberts"],
    field: "Artificial Intelligence",
    rating: 4.8,
    downloads: 2847,
    views: 12453,
  },
  {
    id: 2,
    title: "Quantum Computing Applications in Cryptography",
    abstract: "We explore the implications of quantum computing on modern cryptographic systems...",
    authors: ["Dr. James Wilson", "Dr. Emily Park"],
    field: "Quantum Computing",
    rating: 4.9,
    downloads: 1923,
    views: 8921,
  },
  {
    id: 3,
    title: "Sustainable Energy Storage Solutions for Grid Systems",
    abstract: "Novel approaches to large-scale energy storage using advanced materials...",
    authors: ["Prof. Lisa Anderson", "Dr. Thomas Brown"],
    field: "Energy Systems",
    rating: 4.7,
    downloads: 3124,
    views: 15672,
  },
];

const TrendingPapers = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Trending Papers</h2>
            <p className="text-muted-foreground">Most popular this week</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/explore")}>
          View All
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingPapers.map((paper, index) => (
          <Card 
            key={paper.id} 
            className="hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/paper/${paper.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="shrink-0">
                  {paper.field}
                </Badge>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{paper.rating}</span>
                </div>
              </div>
              <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                {paper.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {paper.abstract}
              </p>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">
                  {paper.authors.join(", ")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{paper.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{paper.downloads.toLocaleString()}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TrendingPapers;
