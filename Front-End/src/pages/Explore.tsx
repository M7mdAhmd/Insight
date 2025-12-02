import MainLayout from "@/components/layout/MainLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Star, SlidersHorizontal, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

interface Paper {
  Paper_ID: number
  Title: string
  Abstract: string
  Publication_Date: string
  Field_Name: string
  Avg_Rating: number
  Download_Count: number
  Review_Count: number
}

const Explore = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [showFilters, setShowFilters] = useState(false)
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedField, setSelectedField] = useState(searchParams.get("field") || "all")
  const [selectedRating, setSelectedRating] = useState(searchParams.get("rating") || "all")
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "relevant")

  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchPapers = async (queryInURL = searchQuery) => {
    setLoading(true)
    setError("")

    try {
      let url = "http://localhost:5000/api/papers"
      const params = new URLSearchParams()

      if (queryInURL.trim()) {
        url = "http://localhost:5000/api/papers/search"
        params.append("q", queryInURL.trim())
      }

      if (selectedField !== "all") params.append("field", selectedField)
      if (selectedRating !== "all") params.append("rating", selectedRating)
      if (selectedYear !== "all") params.append("year", selectedYear)
      if (sortBy !== "relevant") params.append("sortBy", sortBy)
      params.append("page", currentPage.toString())
      params.append("limit", "12")

      const response = await fetch(`${url}?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Failed to fetch papers")

      setPapers(data.data || [])
      setHasMore(data.pagination?.hasMore || false)

      if (queryInURL.trim()) logSearch(queryInURL.trim())
    } catch (err: any) {
      setError(err.message || "Failed to load papers")
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  const logSearch = async (query: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await fetch("http://localhost:5000/api/search/log", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ query }),
      })
    } catch {}
  }

  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchQuery(query)
    setCurrentPage(1)
    fetchPapers(query)
  }, [searchParams, selectedField, selectedRating, selectedYear, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    setSearchParams(trimmed ? { q: trimmed } : {})
  }

  const handleFilterChange = () => setCurrentPage(1)

  const formatDate = (dateString: string) => new Date(dateString).getFullYear().toString()
  const getAuthorsDisplay = () => "Various Authors"

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Research Papers</h1>
          <p className="text-gray-600 text-lg">
            Discover and download cutting-edge research across all disciplines
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search papers by title, abstract, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </Button>
          </form>

          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Field</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedField}
                      onChange={(e) => {
                        setSelectedField(e.target.value)
                        handleFilterChange()
                      }}
                    >
                      <option value="all">All Fields</option>
                      <option value="AI">AI</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedRating}
                      onChange={(e) => {
                        setSelectedRating(e.target.value)
                        handleFilterChange()
                      }}
                    >
                      <option value="all">All Ratings</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.0">4.0+ Stars</option>
                      <option value="3.0">3.0+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value)
                        handleFilterChange()
                      }}
                    >
                      <option value="all">All Time</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        handleFilterChange()
                      }}
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="downloads">Most Downloaded</option>
                      <option value="rating">Highest Rated</option>
                      <option value="recent">Most Recent</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {!loading && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {papers.length} result{papers.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {!loading && papers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {papers.map((paper) => (
              <Card
                key={paper.Paper_ID}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/paper/${paper.Paper_ID}`)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg line-clamp-2 hover:text-indigo-600">{paper.Title}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{paper.Field_Name || "General"}</Badge>
                      <span className="text-gray-500">{formatDate(paper.Publication_Date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{paper.Avg_Rating ? paper.Avg_Rating.toFixed(1) : "N/A"}</span>
                      <span className="text-gray-500 text-sm">({paper.Review_Count || 0} reviews)</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{paper.Abstract}</p>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" /> {getAuthorsDisplay()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Download className="w-4 h-4 mr-1" /> {paper.Download_Count?.toLocaleString() || 0}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/paper/${paper.Paper_ID}`)
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && papers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? `No papers found for "${searchQuery}". Try different keywords or filters.`
                : "No papers available. Try adjusting your filters."}
            </p>
          </div>
        )}

        {!loading && papers.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </Button>
            <Button variant="outline" disabled>
              Page {currentPage}
            </Button>
            <Button variant="outline" disabled={!hasMore} onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Explore