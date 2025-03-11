"use client"

import { Switch } from "@/components/ui/switch"

import type React from "react"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import { useFilms } from "@/lib/use-films"
import type { Film } from "@/lib/types"
import FilmModal from "@/components/film-modal"
import FilmGridItem from "@/components/film-grid-item"
import FilmListItem from "@/components/film-list-item"
import { Grid2X2, List, Filter, ArrowUpDown, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import StableWrapper from "@/components/stable-wrapper"

type ViewMode = "grid" | "list"
type SortOption =
  | "title"
  | "titleDesc"
  | "year"
  | "yearDesc"
  | "genre"
  | "idNumber"
  | "idNumberDesc"
  | "dateAdded"
  | "dateAddedDesc"

type FilterType = "genre" | "director" | "year" | "actor" | "id"

// Simple tab components to replace Radix UI
const SimpleTabs = memo(
  ({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) => {
    return <div className="w-full">{children}</div>
  },
)

SimpleTabs.displayName = "SimpleTabs"

// Revert the SimpleTabsList component to its original style
const SimpleTabsList = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full mb-4 grid grid-cols-5 gap-1 overflow-x-auto flex-nowrap bg-muted p-1 rounded-md">
      {children}
    </div>
  )
})

SimpleTabsList.displayName = "SimpleTabsList"

// Revert the SimpleTabsTrigger component to its original style
const SimpleTabsTrigger = memo(
  ({
    value,
    currentValue,
    onClick,
    children,
  }: {
    value: string
    currentValue: string
    onClick: () => void
    children: React.ReactNode
  }) => {
    const isActive = value === currentValue
    return (
      <button
        className={`text-sm px-3 py-1.5 rounded-sm ${
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    )
  },
)

SimpleTabsTrigger.displayName = "SimpleTabsTrigger"

const SimpleTabsContent = memo(
  ({ value, currentValue, children }: { value: string; currentValue: string; children: React.ReactNode }) => {
    if (value !== currentValue) return null
    return <div className="mt-2">{children}</div>
  },
)

SimpleTabsContent.displayName = "SimpleTabsContent"

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const SearchScreen = () => {
  const router = useRouter()
  const { searchFilms, deleteFilm, films } = useFilms()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Film[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("title")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Change to multiple filter types
  const [activeFilterTypes, setActiveFilterTypes] = useState<FilterType[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedActor, setSelectedActor] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [genreSearch, setGenreSearch] = useState("")
  const [directorSearch, setDirectorSearch] = useState("")
  const [yearSearch, setYearSearch] = useState("")
  const [actorSearch, setActorSearch] = useState("")
  const [idSearch, setIdSearch] = useState("")
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState<FilterType>("genre")
  const [expandedFilm, setExpandedFilm] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isLoading, setIsLoading] = useState(false)

  // Move this function definition up in the file, right after the state declarations
  // and before any useEffect hooks or other function definitions that might use it
  const resetFilters = useCallback(() => {
    setActiveFilterTypes([])
    setSelectedGenre(null)
    setSelectedDirector(null)
    setSelectedYear(null)
    setSelectedActor(null)
    setSelectedId(null)
    setGenreSearch("")
    setDirectorSearch("")
    setYearSearch("")
    setActorSearch("")
    setIdSearch("")
  }, [])

  const searchParams = useSearchParams()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    const query = searchParams.get("q")
    if (query && query.trim() && results.length === 0) {
      setSearchTerm(query)
      const searchResults = searchFilms(query)
      setResults(searchResults)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, searchFilms]) // Remove results.length from dependencies

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      const searchResults = searchFilms(debouncedSearchTerm)
      setResults(searchResults)
    }
  }, [debouncedSearchTerm, searchFilms])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchTerm.trim()) {
        const searchResults = searchFilms(searchTerm)
        setResults(searchResults)
        // Reset filters when performing a new search
        resetFilters()
        setSortBy("title")
        setCurrentPage(1)
      } else {
        // Clear results when search term is empty
        setResults([])
      }
    },
    [searchTerm, searchFilms, resetFilters, setSortBy, setCurrentPage],
  )

  const handleFilmClick = useCallback(
    (film: Film) => {
      // Make sure we're using the latest version of the film from the films array
      const latestFilm = films.find((f) => f.id === film.id) || film
      setSelectedFilm(latestFilm)
      setShowModal(true)
    },
    [films],
  )

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
  }, [])

  const toggleExpandFilm = useCallback((filmId: string) => {
    setExpandedFilm((prev) => (prev === filmId ? null : filmId))
  }, [])

  const handleDeleteFilm = useCallback(
    (id: string) => {
      deleteFilm(id)
      setShowDeleteConfirm(null)
      setExpandedFilm(null)
    },
    [deleteFilm],
  )

  const loadMore = useCallback(() => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1)
      setIsLoading(false)
    }, 500)
  }, [])

  // Get unique values for filters
  const genres = useMemo(() => [...new Set(results.map((film) => film.genre).filter(Boolean))], [results])
  const directors = useMemo(() => [...new Set(results.map((film) => film.director).filter(Boolean))], [results])
  const years = useMemo(() => [...new Set(results.map((film) => film.year).filter(Boolean))].sort(), [results])
  const actors = useMemo(
    () => [
      ...new Set(
        results
          .flatMap((film) => film.actors?.split(",") || [])
          .map((actor) => actor.trim())
          .filter(Boolean),
      ),
    ],
    [results],
  )
  const ids = useMemo(() => [...new Set(results.map((film) => film.idNumber).filter(Boolean))].sort(), [results])

  // Toggle filter type
  const toggleFilterType = useCallback((type: FilterType) => {
    setActiveFilterTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }, [])

  // Handle filter selection
  const handleFilterSelect = useCallback(
    (type: FilterType, value: string | null) => {
      // Set the selected value for the specific filter type
      switch (type) {
        case "genre":
          setSelectedGenre(value)
          if (value && !activeFilterTypes.includes("genre")) {
            setActiveFilterTypes((prev) => [...prev, "genre"])
          } else if (!value && activeFilterTypes.includes("genre")) {
            setActiveFilterTypes((prev) => prev.filter((t) => t !== "genre"))
          }
          break
        case "director":
          setSelectedDirector(value)
          if (value && !activeFilterTypes.includes("director")) {
            setActiveFilterTypes((prev) => [...prev, "director"])
          } else if (!value && activeFilterTypes.includes("director")) {
            setActiveFilterTypes((prev) => prev.filter((t) => t !== "director"))
          }
          break
        case "year":
          setSelectedYear(value)
          if (value && !activeFilterTypes.includes("year")) {
            setActiveFilterTypes((prev) => [...prev, "year"])
          } else if (!value && activeFilterTypes.includes("year")) {
            setActiveFilterTypes((prev) => prev.filter((t) => t !== "year"))
          }
          break
        case "actor":
          setSelectedActor(value)
          if (value && !activeFilterTypes.includes("actor")) {
            setActiveFilterTypes((prev) => [...prev, "actor"])
          } else if (!value && activeFilterTypes.includes("actor")) {
            setActiveFilterTypes((prev) => prev.filter((t) => t !== "actor"))
          }
          break
        case "id":
          setSelectedId(value)
          if (value && !activeFilterTypes.includes("id")) {
            setActiveFilterTypes((prev) => [...prev, "id"])
          } else if (!value && activeFilterTypes.includes("id")) {
            setActiveFilterTypes((prev) => prev.filter((t) => t !== "id"))
          }
          break
      }
    },
    [activeFilterTypes],
  )

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveFilterTab(value as FilterType)
  }, [])

  // Update filter logic to use multiple selected filters
  const filteredAndSortedResults = useMemo(() => {
    return [...results]
      .filter((film) => {
        // If no filters are active, include all results
        if (activeFilterTypes.length === 0) {
          return true
        }

        // Check each active filter type
        return activeFilterTypes.every((type) => {
          switch (type) {
            case "genre":
              return selectedGenre ? film.genre === selectedGenre : true
            case "director":
              return selectedDirector ? film.director === selectedDirector : true
            case "year":
              return selectedYear ? film.year === selectedYear : true
            case "actor":
              const actorsList = film.actors?.split(",").map((a) => a.trim()) || []
              return selectedActor ? actorsList.includes(selectedActor) : true
            case "id":
              return selectedId ? film.idNumber === selectedId : true
            default:
              return true
          }
        })
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title)
          case "titleDesc":
            return b.title.localeCompare(a.title)
          case "year":
            return (a.year || "0").localeCompare(b.year || "0")
          case "yearDesc":
            return (b.year || "0").localeCompare(a.year || "0")
          case "genre":
            return (a.genre || "").localeCompare(b.genre || "")
          case "idNumber":
            return (a.idNumber || "0").localeCompare(b.idNumber || "0")
          case "idNumberDesc":
            return (b.idNumber || "0").localeCompare(a.idNumber || "0")
          case "dateAdded":
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          case "dateAddedDesc":
            return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          default:
            return 0
        }
      })
  }, [results, activeFilterTypes, selectedGenre, selectedDirector, selectedYear, selectedActor, selectedId, sortBy])

  // Group films by first letter for list view
  const groupedFilms = useMemo(() => {
    if (viewMode !== "list") return {}

    const groups: Record<string, Film[]> = {}

    // Only process if we have results
    if (filteredAndSortedResults && filteredAndSortedResults.length > 0) {
      for (const film of filteredAndSortedResults) {
        const firstLetter = film.title.charAt(0).toUpperCase()
        if (!groups[firstLetter]) {
          groups[firstLetter] = []
        }
        groups[firstLetter].push(film)
      }
    }

    return groups
  }, [filteredAndSortedResults, viewMode])

  // Update activeFilterCount calculation
  const activeFilterCount = activeFilterTypes.length

  const paginatedResults = useMemo(() => {
    return filteredAndSortedResults.slice(0, currentPage * itemsPerPage)
  }, [filteredAndSortedResults, currentPage, itemsPerPage])

  const hasMoreItems = useMemo(() => {
    return filteredAndSortedResults.length > currentPage * itemsPerPage
  }, [filteredAndSortedResults.length, currentPage, itemsPerPage])

  // Update dependencies to include new filter state
  useEffect(() => {
    // Only reset if we're not on page 1 already
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [
    activeFilterTypes,
    selectedGenre,
    selectedDirector,
    selectedYear,
    selectedActor,
    selectedId,
    sortBy,
    searchTerm,
    currentPage,
  ])

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
    }
  }, [searchTerm])

  const renderVirtualizedResults = useCallback(() => {
    if (paginatedResults.length <= 20) {
      // Use regular grid for small lists
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedResults.map((film, index) => (
            <div
              key={film.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`,
              }}
            >
              <FilmGridItem film={film} onClick={() => handleFilmClick(film)} />
            </div>
          ))}
        </div>
      )
    }

    // Use virtualized list for larger lists
    const rowCount = Math.ceil(paginatedResults.length / 4) // 4 items per row for desktop
    const rowHeight = 280 // Approximate height of each row

    return (
      <List
        height={Math.min(rowCount * rowHeight, 800)} // Max height of 800px
        itemCount={rowCount}
        itemSize={rowHeight}
        width="100%"
        className="overflow-x-hidden"
      >
        {({ index, style }) => {
          const startIdx = index * 4
          const rowFilms = paginatedResults.slice(startIdx, startIdx + 4)

          return (
            <div style={style} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rowFilms.map((film, filmIndex) => (
                <div
                  key={film.id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${filmIndex * 50}ms`,
                    opacity: 0,
                    animation: `fadeIn 0.5s ease-out ${filmIndex * 50}ms forwards`,
                  }}
                >
                  <FilmGridItem film={film} onClick={() => handleFilmClick(film)} />
                </div>
              ))}
            </div>
          )
        }}
      </List>
    )
  }, [paginatedResults, handleFilmClick])

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Search</h1>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!e.target.value.trim()) {
                  setResults([])
                }
              }}
              className="h-14 pl-4 pr-14 rounded-[10px]"
            />
            {/* Find the Search button in the form */}
            <Button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-0 h-6 w-6 bg-transparent hover:bg-transparent"
            >
              <Search className="h-6 w-6 text-black dark:text-white" />
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[180px]">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full h-12 rounded-[10px] flex items-center justify-between card-shadow bg-primary dark:bg-black hover:bg-primary/90 dark:hover:bg-black/90 dark:text-white dark:border dark:border-white"
            >
              <span className="hidden sm:inline">
                {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filter"}
              </span>
              <span className="sm:hidden">
                {activeFilterCount > 0 ? <span className="mr-1">{activeFilterCount}</span> : ""}
                <Filter size={20} />
              </span>
              <Filter size={16} className="sm:block hidden" />
            </Button>

            {showAdvancedFilters && (
              <div className="mt-2 p-4 border-[1px] border-black dark:border-white rounded-[10px] bg-white dark:bg-black shadow-md">
                <div className="mb-4 grid grid-cols-5 gap-2">
                  {(["genre", "director", "year", "actor", "id"] as FilterType[]).map((type) => (
                    <div key={type} className="flex flex-col items-center">
                      <Switch
                        id={`filter-toggle-${type}`}
                        checked={activeFilterTypes.includes(type)}
                        onCheckedChange={() => {
                          // Use the toggleFilterType function which already has the logic
                          toggleFilterType(type)
                        }}
                      />
                      <Label htmlFor={`filter-toggle-${type}`} className="mt-1 text-xs sm:text-sm cursor-pointer">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>

                <StableWrapper>
                  <SimpleTabs value={activeFilterTab} onChange={handleTabChange}>
                    <SimpleTabsList>
                      <SimpleTabsTrigger
                        value="genre"
                        currentValue={activeFilterTab}
                        onClick={() => handleTabChange("genre")}
                      >
                        Genre
                      </SimpleTabsTrigger>
                      <SimpleTabsTrigger
                        value="director"
                        currentValue={activeFilterTab}
                        onClick={() => handleTabChange("director")}
                      >
                        Director
                      </SimpleTabsTrigger>
                      <SimpleTabsTrigger
                        value="year"
                        currentValue={activeFilterTab}
                        onClick={() => handleTabChange("year")}
                      >
                        Year
                      </SimpleTabsTrigger>
                      <SimpleTabsTrigger
                        value="actor"
                        currentValue={activeFilterTab}
                        onClick={() => handleTabChange("actor")}
                      >
                        Actor
                      </SimpleTabsTrigger>
                      <SimpleTabsTrigger
                        value="id"
                        currentValue={activeFilterTab}
                        onClick={() => handleTabChange("id")}
                      >
                        ID
                      </SimpleTabsTrigger>
                    </SimpleTabsList>

                    {/* Genre Tab Content */}
                    <SimpleTabsContent value="genre" currentValue={activeFilterTab}>
                      <div className="space-y-2 max-h-[320px] overflow-hidden flex flex-col">
                        <Input
                          placeholder="Search genres..."
                          value={genreSearch}
                          onChange={(e) => setGenreSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="overflow-y-auto flex-grow pr-2">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterSelect("genre", null)}
                              className="text-xs h-7 px-2"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {genres
                              .filter((genre) => genre.toLowerCase().includes(genreSearch.toLowerCase()))
                              .map((genre) => {
                                // Count films with this genre
                                const count = results.filter((film) => film.genre === genre).length
                                const isSelected = selectedGenre === genre

                                return (
                                  <div key={genre} className="flex items-center justify-between">
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      className={`justify-start text-left h-8 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => handleFilterSelect("genre", isSelected ? null : genre)}
                                    >
                                      {genre}
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      {count}
                                    </Badge>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </SimpleTabsContent>

                    {/* Director Tab Content */}
                    <SimpleTabsContent value="director" currentValue={activeFilterTab}>
                      <div className="space-y-2 max-h-[320px] overflow-hidden flex flex-col">
                        <Input
                          placeholder="Search directors..."
                          value={directorSearch}
                          onChange={(e) => setDirectorSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="overflow-y-auto flex-grow pr-2">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterSelect("director", null)}
                              className="text-xs h-7 px-2"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {directors
                              .filter((director) => director.toLowerCase().includes(directorSearch.toLowerCase()))
                              .map((director) => {
                                // Count films with this director
                                const count = results.filter((film) => film.director === director).length
                                const isSelected = selectedDirector === director

                                return (
                                  <div key={director} className="flex items-center justify-between">
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      className={`justify-start text-left h-8 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => handleFilterSelect("director", isSelected ? null : director)}
                                    >
                                      {director}
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      {count}
                                    </Badge>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </SimpleTabsContent>

                    {/* Year Tab Content */}
                    <SimpleTabsContent value="year" currentValue={activeFilterTab}>
                      <div className="space-y-2 max-h-[320px] overflow-hidden flex flex-col">
                        <Input
                          placeholder="Search years..."
                          value={yearSearch}
                          onChange={(e) => setYearSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="overflow-y-auto flex-grow pr-2">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterSelect("year", null)}
                              className="text-xs h-7 px-2"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {years
                              .filter((year) => year.includes(yearSearch))
                              .map((year) => {
                                // Count films with this year
                                const count = results.filter((film) => film.year === year).length
                                const isSelected = selectedYear === year

                                return (
                                  <div key={year} className="flex items-center justify-between">
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      className={`justify-start text-left h-8 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => handleFilterSelect("year", isSelected ? null : year)}
                                    >
                                      {year}
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      {count}
                                    </Badge>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </SimpleTabsContent>

                    {/* Actor Tab Content */}
                    <SimpleTabsContent value="actor" currentValue={activeFilterTab}>
                      <div className="space-y-2 max-h-[320px] overflow-hidden flex flex-col">
                        <Input
                          placeholder="Search actors..."
                          value={actorSearch}
                          onChange={(e) => setActorSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="overflow-y-auto flex-grow pr-2">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterSelect("actor", null)}
                              className="text-xs h-7 px-2"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {actors
                              .filter((actor) => actor.toLowerCase().includes(actorSearch.toLowerCase()))
                              .map((actor) => {
                                // Count films with this actor
                                const count = results.filter((film) =>
                                  film.actors
                                    ?.split(",")
                                    .map((a) => a.trim())
                                    .includes(actor),
                                ).length
                                const isSelected = selectedActor === actor

                                return (
                                  <div key={actor} className="flex items-center justify-between">
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      className={`justify-start text-left h-8 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => handleFilterSelect("actor", isSelected ? null : actor)}
                                    >
                                      {actor}
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      {count}
                                    </Badge>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </SimpleTabsContent>

                    {/* ID Tab Content */}
                    <SimpleTabsContent value="id" currentValue={activeFilterTab}>
                      <div className="space-y-2 max-h-[320px] overflow-hidden flex flex-col">
                        <Input
                          placeholder="Search IDs..."
                          value={idSearch}
                          onChange={(e) => setIdSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="overflow-y-auto flex-grow pr-2">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterSelect("id", null)}
                              className="text-xs h-7 px-2"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {ids
                              .filter((id) => id.includes(idSearch))
                              .map((id) => {
                                // Count films with this ID (should be 1 but just in case)
                                const count = results.filter((film) => film.idNumber === id).length
                                const isSelected = selectedId === id

                                return (
                                  <div key={id} className="flex items-center justify-between">
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      className={`justify-start text-left h-8 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                                      onClick={() => handleFilterSelect("id", isSelected ? null : id)}
                                    >
                                      {id}
                                    </Button>
                                    <Badge variant="outline" className="ml-2">
                                      {count}
                                    </Badge>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </SimpleTabsContent>
                  </SimpleTabs>
                </StableWrapper>

                <div className="mt-4">
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="w-full rounded-[10px] border-[1px] border-black"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[180px]">
            <StableWrapper>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-12 w-full rounded-[10px] border-[1px] border-black dark:border-white bg-primary dark:bg-black text-primary-foreground dark:text-white card-shadow px-3 appearance-none text-sm"
                >
                  <option value="" disabled>
                    Sort
                  </option>
                  <option value="title">Title (Ascending)</option>
                  <option value="titleDesc">Title (Descending)</option>
                  <option value="year">Year (Oldest)</option>
                  <option value="yearDesc">Year (Newest)</option>
                  <option value="idNumber">ID (Ascending)</option>
                  <option value="idNumberDesc">ID (Descending)</option>
                  <option value="dateAdded">Recently Added</option>
                  <option value="dateAddedDesc">Oldest Added</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ArrowUpDown className="h-5 w-5" />
                </div>
              </div>
            </StableWrapper>
          </div>

          <div className="flex-1 min-w-[120px] max-w-[120px]">
            <div className="flex items-center justify-center h-12 rounded-[10px] bg-black dark:bg-black px-2 card-shadow border border-transparent dark:border-white">
              <div className="flex gap-2 w-full justify-center">
                <button
                  onClick={toggleViewMode}
                  className={`p-2 rounded-md ${viewMode === "grid" ? "text-lime-green" : "text-white"}`}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={20} />
                </button>
                <button
                  onClick={toggleViewMode}
                  className={`p-2 rounded-md ${viewMode === "list" ? "text-lime-green" : "text-white"}`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Results</h2>

        {results.length > 0 ? (
          viewMode === "grid" ? (
            <>
              {renderVirtualizedResults()}

              {hasMoreItems && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-2 rounded-[10px] bg-coral hover:bg-coral-hover transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Loading more films...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>Load More</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2 animate-bounce"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFilms || {}).map(([letter, films]) => (
                <div key={letter} className="space-y-2 relative">
                  <h2 className="text-4xl font-bold text-gray-300 mb-4 sticky top-0 bg-white py-2 z-10">{letter}</h2>
                  {films.map((film) => (
                    <div key={film.id}>
                      <div className="cursor-pointer" onClick={() => toggleExpandFilm(film.id)}>
                        <FilmListItem
                          film={film}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpandFilm(film.id)
                          }}
                        />
                      </div>

                      {expandedFilm === film.id && (
                        <div
                          className="bg-gray-100 p-4 rounded-b-[20px] mt-[-10px] overflow-hidden transition-all duration-500 ease-in-out"
                          style={{
                            maxHeight: "500px",
                            animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                          }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold">Director:</p>
                              <p>{film.director || "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Year:</p>
                              <p>{film.year || "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Genre:</p>
                              <p>{film.genre || "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Actors:</p>
                              <p>{film.actors || "—"}</p>
                            </div>
                            {film.tags && (
                              <div className="col-span-2">
                                <p className="font-semibold">Tags:</p>
                                <p>{film.tags}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end mt-4 space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full w-10 h-10 p-0"
                              onClick={() => handleFilmClick(film)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-pencil"
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>
                            {showDeleteConfirm === film.id ? (
                              <div className="text-center py-2">
                                <p className="font-medium mb-3">Sure about that?</p>
                                <div className="flex justify-center space-x-3">
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteFilm(film.id)}>
                                    Delete
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full w-10 h-10 p-0 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => setShowDeleteConfirm(film.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-trash-2"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  <line x1="10" x2="10" y1="11" y2="17" />
                                  <line x1="14" x2="14" y1="11" y2="17" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : searchTerm ? (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-[20px]">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No results found for "{searchTerm}"</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Try a different search term or add a new film</p>
            <Button onClick={() => router.push("/dashboard/add")} className="mt-4 bg-coral hover:bg-coral-hover">
              Add a new film
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-[20px]">
            <p className="text-gray-500 dark:text-gray-400">Enter a search term to find films</p>
          </div>
        )}
      </div>

      <NavigationBar active="search" />

      {showModal && selectedFilm && <FilmModal film={selectedFilm} onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default memo(SearchScreen)

