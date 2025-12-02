import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MapPin, FileText, Loader2, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

interface Author {
  Author_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Country: string;
  Picture: string;
  numeber_of_papers: string;
}

interface Stats {
  Total_Authors: number;
  Total_Countries: number;
  Avg_Papers_Per_Author: number;
}

const Authors = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({ Total_Authors: 0, Total_Countries: 0, Avg_Papers_Per_Author: 0 });
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [minPapers, setMinPapers] = useState("");
  const [sortBy, setSortBy] = useState("papers");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "12");
      params.append("sortBy", sortBy);
      if (selectedCountry !== "all") params.append("country", selectedCountry);
      if (minPapers) params.append("minPapers", minPapers);

      const url = `http://localhost:5000/api/authors?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch authors");
      setAuthors(data.data || []);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err: any) {
      setError(err.message || "Failed to load authors");
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/authors/stats");
      const data = await res.json();
      if (res.ok && data.data) setStats(data.data);
    } catch {}
  };

  useEffect(() => {
    setAuthors([]);
    fetchAuthors();
    fetchStats();
  }, [location.key, currentPage, selectedCountry, minPapers, sortBy]);

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-muted/30">
        <div className="absolute inset-0 z-0">
          <img src={heroBackground} className="w-full h-full object-cover opacity-5" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mx-auto">
            <Users className="h-4 w-4" /> Leading Researchers Worldwide
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">Research Authors</h1>
          <p className="text-xl text-muted-foreground">Connect with pioneering researchers and explore their contributions</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search authors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-2"
            />
          </div>
          <div className="grid grid-cols-3 gap-6 pt-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{stats.Total_Authors.toLocaleString()}+</div>
            <div className="text-sm text-muted-foreground">Active Authors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-secondary">{stats.Total_Countries}+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">{Math.round(stats.Avg_Papers_Per_Author)}</div>
            <div className="text-sm text-muted-foreground">Avg Papers</div>
          </div>
          </div>

        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-muted-foreground">{loading ? "Loading..." : `Showing ${authors.length} authors`}</p>
          <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="animate-fade-in mb-6">
            <div className="p-6 grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-background" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
                  <option value="all">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="China">China</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Min Papers</label>
                <Input type="number" placeholder="e.g. 10" value={minPapers} onChange={e => setMinPapers(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-background" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="papers">Most Papers</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
        {loading && <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}

        {!loading && authors.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author, index) => (
              <Card
                key={author.Author_ID}
                className="hover:shadow-card-hover transition-all duration-300 cursor-pointer group animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/author/${author.Author_ID}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl shrink-0">
                      {author.Picture
                        ? <img src={author.Picture} alt={`${author.First_Name} ${author.Last_Name}`} className="w-full h-full object-cover" />
                        : `${author.First_Name[0]}${author.Last_Name[0]}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{author.First_Name} {author.Last_Name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{author.Country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="text-sm font-bold text-primary flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3" /> {author.numeber_of_papers || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Papers</div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" onClick={(e) => { e.stopPropagation(); navigate(`/author/${author.Author_ID}`); }}>
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && authors.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No authors found</p>
            <p className="text-gray-400 text-sm">{searchQuery ? "Try different search terms or adjust your filters" : "No authors available at the moment"}</p>
          </div>
        )}

        {!loading && authors.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            <Button variant="outline" disabled>Page {currentPage}</Button>
            <Button variant="outline" disabled={!hasMore} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Authors;