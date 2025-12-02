import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  Star, 
  Eye,
  Users,
  Calendar,
  MessageSquare,
  Send,
  Sparkles,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Author {
  Author_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Country: string;
  Write_Date: string;
}

interface Paper {
  Paper_ID: number;
  Title: string;
  Abstract: string;
  Publication_Date: string;
  Path: string;
  Field_Name: string;
  Field_ID: number;
  Field_Description: string;
  Avg_Rating: number;
  Download_Count: number;
  Review_Count: number;
  Authors: Author[];
  Keywords: string;
}

interface Review {
  Review_ID: number;
  Rating: number;
  Review_Date: string;
  Reviewer_Name: string;
  Affiliation: string;
  Specialization: string;
}

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedPapers, setRelatedPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch paper details
  useEffect(() => {
    if (id) {
      fetchPaperDetails();
      fetchReviews();
      fetchRelatedPapers();
    }
  }, [id]);

  const fetchPaperDetails = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:5000/api/papers/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch paper");
      }
      
      setPaper(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load paper");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/paper/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const fetchRelatedPapers = async () => {
    try {
      // Fetch papers from the same field
      const response = await fetch(`http://localhost:5000/api/papers?limit=4`);
      const data = await response.json();
      
      if (response.ok) {
        // Filter out current paper
        const filtered = (data.data || []).filter((p: any) => p.Paper_ID !== parseInt(id || "0"));
        setRelatedPapers(filtered.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch related papers:", err);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to download papers");
      navigate("/login");
      return;
    }
    
    setDownloading(true);
    
    try {
      // Log the download
      const response = await fetch(`http://localhost:5000/api/downloads/paper/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to log download");
      }
      
      // Simulate download (replace with actual file download)
      alert("Download started! (In production, this would download the PDF file)");
      
      // Refresh paper to update download count
      fetchPaperDetails();
    } catch (err: any) {
      alert(err.message || "Failed to download paper");
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }
    
    if (reviewRating === 0) {
      alert("Please select a rating");
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/paper/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
      
      alert("Review submitted successfully!");
      setReviewRating(0);
      fetchReviews();
      fetchPaperDetails();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  if (error || !paper) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Paper Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The paper you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate("/explore")}>Browse Papers</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const keywords = paper.Keywords ? paper.Keywords.split(",").map(k => k.trim()) : [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Paper Header */}
          <div className="space-y-4 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              ← Back
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{paper.Title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="text-sm">{paper.Field_Name}</Badge>
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-500 shrink-0">
                <Star className="h-6 w-6 fill-current" />
                <span className="text-2xl font-bold">
                  {paper.Avg_Rating ? paper.Avg_Rating.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(paper.Publication_Date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{paper.Download_Count?.toLocaleString() || 0} downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{paper.Review_Count || 0} reviews</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                {downloading ? "Downloading..." : "Download PDF"}
              </Button>
              {paper.Path && (
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href={paper.Path} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                    View External
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Authors */}
          {paper.Authors && paper.Authors.length > 0 && (
            <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Authors
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {paper.Authors.map((author) => (
                    <div 
                      key={author.Author_ID} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {author.First_Name[0]}{author.Last_Name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{author.First_Name} {author.Last_Name}</p>
                        <p className="text-sm text-muted-foreground">{author.Country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Abstract */}
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Abstract</h2>
              <p className="text-muted-foreground leading-relaxed">{paper.Abstract}</p>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="animate-fade-in bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20" style={{ animationDelay: "300ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Ask AI About This Paper</h2>
              </div>
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask questions about methodology, findings, or implications..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="min-h-24"
                />
                <Button className="gap-2" onClick={() => alert("AI feature coming soon!")}>
                  <Send className="h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.Review_ID} className="p-4 mb-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.Reviewer_Name}</span>
                        <span className="text-sm text-muted-foreground">
                          • {review.Affiliation}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm">{review.Rating}</span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(review.Review_Date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.Specialization}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review this paper!
                </p>
              )}

              <div className="space-y-3 pt-6 border-t">
                <h3 className="font-semibold">Rate This Paper</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Your rating:</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star 
                        key={rating} 
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          rating <= reviewRating 
                            ? "text-amber-500 fill-current" 
                            : "text-gray-300 hover:text-amber-400"
                        }`}
                        onClick={() => setReviewRating(rating)}
                      />
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <span className="text-sm font-medium">({reviewRating}/5)</span>
                  )}
                </div>
                <Button 
                  className="gap-2"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewRating === 0}
                >
                  {submittingReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Papers */}
          {relatedPapers.length > 0 && (
            <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-8">Related Papers</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPapers.map((related, index) => (
                    <Card
                      key={related.Paper_ID}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/paper/${related.Paper_ID}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="shrink-0">
                            {related.Field_Name || "General"}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">
                              {related.Avg_Rating ? related.Avg_Rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                          {related.Title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.Abstract}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>{related.Download_Count?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/paper/${related.Paper_ID}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PaperDetail;