"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFilms } from "@/lib/use-films"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"
import FilmGridItem from "@/components/film-grid-item"

export default function SearchPage() {
  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Films</CardTitle>
          <CardDescription>Search for films in your personal collection</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchComponent />
        </CardContent>
      </Card>
    </div>
  )
}

// Client component for search functionality
function SearchComponent() {
  const { searchFilms } = useFilms()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      const searchResults = searchFilms(query)
      setResults(searchResults)
    }
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search your films..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((film) => (
            <FilmGridItem key={film.id} film={film} onClick={() => {}} />
          ))}
        </div>
      ) : (
        query && <p className="text-center py-4">No films found matching your search.</p>
      )}
    </div>
  )
}

