import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Cpu, 
  Building2,
  Atom,
  Globe,
  Leaf,
  BookOpen,
  Zap,
  Database,
  Sparkles,
  Search,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

interface FieldData {
  Field_ID: number;
  Field_Name: string;
  Description: string;
  Paper_Count: number;
  Author_Count: number;
  Avg_Rating: number;
  Trending: boolean;
}

interface Stats {
  Total_Fields: number;
  Total_Papers: number;
  Total_Authors: number;
}

// Icon mapping for different fields
const fieldIcons: { [key: string]: any } = {
  "Medical and Health Sciences": Heart,
  "Medicine": Heart,
  "Engineering": Zap,
  "Computer Science": Cpu,
  "AI": Cpu,
  "Artificial Intelligence": Cpu,
  "Architecture": Building2,
  "Quantum Physics": Atom,
  "Physics": Atom,
  "Space Science": Globe,
  "Economics": Building2,
  "Renewable Energy": Leaf,
  "E-Learning": BookOpen,
  "Data Engineering": Database,
  "Biology": Leaf,
  "Chemistry": Atom,
  "Mathematics": BookOpen,
  "Default": BookOpen
};

const fieldColors: { [key: string]: { color: string; bgColor: string } } = {
  "Artificial Intelligence": { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  "AI": { color: "text-purple-500", bgColor: "bg-purple-500/10" },
  "Quantum Physics": { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "Physics": { color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "Biotechnology": { color: "text-green-500", bgColor: "bg-green-500/10" },
  "Biology": { color: "text-green-500", bgColor: "bg-green-500/10" },
  "Computer Science": { color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  "Medicine": { color: "text-red-500", bgColor: "bg-red-500/10" },
  "Environmental Science": { color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  "Chemistry": { color: "text-orange-500", bgColor: "bg-orange-500/10" },
  "Economics": { color: "text-amber-500", bgColor: "bg-amber-500/10" },
  "Mathematics": { color: "text-pink-500", bgColor: "bg-pink-500/10" },
  "Engineering": { color: "text-teal-500", bgColor: "bg-teal-500/10" },
  "Default": { color: "text-gray-500", bgColor: "bg-gray-500/10" }
};

const getFieldIcon = (fieldName: string) => {
  return fieldIcons[fieldName] || fieldIcons["Default"];
};

const getFieldColors = (fieldName: string) => {
  return fieldColors[fieldName] || fieldColors["Default"];
};

const Fields = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({
    Total_Fields: 0,
    Total_Papers: 0,
    Total_Authors: 0
  });
  
  // Abort controller for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch fields from API
  const fetchFields = async (search = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError("");
    
    try {
      let url = "http://localhost:5000/api/fields";
      const params = new URLSearchParams();
      
      if (search && searchQuery.trim()) {
        url = "http://localhost:5000/api/fields/search";
        params.append("q", searchQuery.trim());
      }
      
      const response = await fetch(`${url}?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch fields");
      }
      
      setFields(data.data || []);
      
      // Log search if applicable
      if (search && searchQuery.trim()) {
        logSearch(searchQuery.trim());
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      setError(err.message || "Failed to load fields");
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch overall statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/fields/stats/overall");
      const data = await response.json();
      
      if (response.ok && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Log search to database
  const logSearch = async (query: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await fetch("http://localhost:5000/api/search/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });
    } catch (err) {
      console.error("Failed to log search:", err);
    }
  };

  // Load fields on mount
  useEffect(() => {
    fetchFields(false);
    fetchStats();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchFields(true);
      } else if (searchQuery === "") {
        fetchFields(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFieldClick = (fieldName: string) => {
    navigate(`/explore?field=${encodeURIComponent(fieldName)}`);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Explore Research Disciplines
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              Research Fields
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Discover groundbreaking research across diverse academic disciplines
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search fields by name or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary">
                  {stats.Total_Fields}+
                </div>
                <div className="text-sm text-muted-foreground">Research Fields</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">
                  {stats.Total_Papers.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">Total Papers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">
                  {stats.Total_Authors.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground">Active Authors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fields Grid */}
      <div className="container mx-auto px-4 py-16">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="mb-8">
              <p className="text-muted-foreground">
                Showing {fields.length} field{fields.length !== 1 ? "s" : ""}
              </p>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No fields found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "No research fields available at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field, index) => {
                  const FieldIcon = getFieldIcon(field.Field_Name);
                  const colors = getFieldColors(field.Field_Name);
                  
                  return (
                    <Card
                      key={field.Field_ID}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleFieldClick(field.Field_Name)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`${colors.bgColor} ${colors.color} p-4 rounded-xl`}>
                            <FieldIcon className="h-8 w-8" />
                          </div>
                          {field.Trending && (
                            <Badge variant="secondary" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                          {field.Field_Name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {field.Description || "Explore cutting-edge research in this field"}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{field.Paper_Count?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{field.Author_Count?.toLocaleString() || 0}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full gap-2 mt-4" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFieldClick(field.Field_Name);
                          }}
                        >
                          Explore Field
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Fields;