"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "@/components/navigation-bar"
import { useFilms } from "@/lib/use-films"
import type { Film } from "@/lib/types"
import FilmModal from "@/components/film-modal"
import FilmGridItem from "@/components/film-grid-item"
import { Grid2X2, ListIcon as IconList, Filter, Search, ArrowUpDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import StableWrapper from "@/components/stable-wrapper"
// First, import the LoadingAnimation component at the top of the file
import LoadingAnimation from "@/components/loading-animation"
import { FixedSizeList as List } from "react-window"

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

// Use a simple component for the filter tabs to avoid Radix UI issues
const SimpleTabs = memo(
  ({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) => {
    return <div className="w-full">{children}</div>
  },
)

SimpleTabs.displayName = "SimpleTabs"

const SimpleTabsList = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full mb-4 grid grid-cols-5 gap-1 overflow-x-auto flex-nowrap bg-muted p-1 rounded-md">
      {children}
    </div>
  )
})

SimpleTabsList.displayName = "SimpleTabsList"

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

// Main component
const LibraryScreen = () => {
  const router = useRouter()
  const { films, deleteFilm } = useFilms()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("title")
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState<FilterType>("genre")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [expandedFilm, setExpandedFilm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

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

  // Get unique values for filters
  const genres = useMemo(() => [...new Set(films.map((film) => film.genre).filter(Boolean))], [films])
  const directors = useMemo(() => [...new Set(films.map((film) => film.director).filter(Boolean))], [films])
  const years = useMemo(() => [...new Set(films.map((film) => film.year).filter(Boolean))].sort(), [films])
  const actors = useMemo(
    () => [
      ...new Set(
        films
          .flatMap((film) => film.actors?.split(",") || [])
          .map((actor) => actor.trim())
          .filter(Boolean),
      ),
    ],
    [films],
  )
  const ids = useMemo(() => [...new Set(films.map((film) => film.idNumber).filter(Boolean))].sort(), [films])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const newMode = prev === "grid" ? "list" : "grid"
      console.log("Toggling view mode from", prev, "to", newMode)
      return newMode
    })
  }, [])

  // Update resetFilters function to clear all filter selections
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

  // Filter and sort films
  const filteredAndSortedFilms = useMemo(() => {
    return [...films]
      .filter((film) => {
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const matchesSearch =
            film.title.toLowerCase().includes(searchLower) ||
            film.director.toLowerCase().includes(searchLower) ||
            film.actors.toLowerCase().includes(searchLower) ||
            film.idNumber.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }

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
  }, [
    films,
    searchTerm,
    activeFilterTypes,
    selectedGenre,
    selectedDirector,
    selectedYear,
    selectedActor,
    selectedId,
    sortBy,
  ])

  // Group films by first letter for list view
  const groupedFilms = useMemo(() => {
    if (viewMode !== "list") return null

    const groups: { [key: string]: Film[] } = {}
    filteredAndSortedFilms.forEach((film) => {
      const firstLetter = film.title.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(film)
    })
    return groups
  }, [filteredAndSortedFilms, viewMode])

  const handleFilmClick = useCallback(
    (film: Film) => {
      // Make sure we're using the latest version of the film from the films array
      const latestFilm = films.find((f) => f.id === film.id) || film
      setSelectedFilm(latestFilm)
      setShowModal(true)
    },
    [films],
  )

  // Update activeFilterCount calculation
  const activeFilterCount = activeFilterTypes.length

  const paginatedFilms = useMemo(() => {
    return filteredAndSortedFilms.slice(0, currentPage * itemsPerPage)
  }, [filteredAndSortedFilms, currentPage, itemsPerPage])

  const loadMore = useCallback(() => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1)
      setIsLoading(false)
    }, 500)
  }, [])

  const hasMoreItems = useMemo(() => {
    return filteredAndSortedFilms.length > currentPage * itemsPerPage
  }, [filteredAndSortedFilms.length, currentPage, itemsPerPage])

  // Add this useEffect to reset the current page when filters change
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

  // Add this useEffect to adjust items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(8)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(12)
      } else {
        setItemsPerPage(16)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Group films by first letter for grid view
  const groupedFilmsForGrid = useMemo(() => {
    // Create a stable empty result for when there are no films
    if (!paginatedFilms || paginatedFilms.length === 0) {
      return []
    }

    // Use a simple approach to group films
    const groups: Record<string, Film[]> = {}

    for (const film of paginatedFilms) {
      if (!film.title) continue // Skip films without titles

      const firstLetter = film.title.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(film)
    }

    // Convert to array and sort
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [paginatedFilms])

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveFilterTab(value as FilterType)
  }, [])

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as SortOption)
  }, [])

  // FilmListItem component
  const FilmListItem = memo(({ film, onClick }: { film: Film; onClick?: (event: React.MouseEvent) => void }) => {
    return (
      <div
        className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-800 rounded-[20px] hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors card-shadow hover:translate-y-[-2px] transition-all group"
        onClick={onClick}
      >
        <h3 className="font-medium text-black dark:text-white">{film.title}</h3>
        <div className="flex items-center">
          <span className="text-black dark:text-white">Nr #{film.idNumber}</span>
        </div>
      </div>
    )
  })

  FilmListItem.displayName = "FilmListItem"

  // Add this optimization for the filter functions
  const filteredGenres = useMemo(() => {
    return genres.filter((genre) => genre.toLowerCase().includes(genreSearch.toLowerCase()))
  }, [genres, genreSearch])

  const filteredDirectors = useMemo(() => {
    return directors.filter((director) => director.toLowerCase().includes(directorSearch.toLowerCase()))
  }, [directors, directorSearch])

  const filteredYears = useMemo(() => {
    return years.filter((year) => year.includes(yearSearch))
  }, [years, yearSearch])

  const filteredActors = useMemo(() => {
    return actors.filter((actor) => actor.toLowerCase().includes(actorSearch.toLowerCase()))
  }, [actors, actorSearch])

  const filteredIds = useMemo(() => {
    return ids.filter((id) => id.includes(idSearch))
  }, [ids, idSearch])

  // Add this function before the return statement
  const renderVirtualizedGrid = useCallback(() => {
    if (paginatedFilms.length <= 20) {
      // Use regular grid for small lists
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedFilms.map((film) => (
            <FilmGridItem key={film.id} film={film} onClick={() => handleFilmClick(film)} />
          ))}
        </div>
      )
    }

    // Use virtualized list for larger lists
    const rowCount = Math.ceil(paginatedFilms.length / 4) // 4 items per row for desktop
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
          const rowFilms = paginatedFilms.slice(startIdx, startIdx + 4)

          return (
            <div style={style} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rowFilms.map((film) => (
                <FilmGridItem key={film.id} film={film} onClick={() => handleFilmClick(film)} />
              ))}
            </div>
          )
        }}
      </List>
    )
  }, [paginatedFilms, handleFilmClick])

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
          <h1 className="text-3xl font-bold">Library</h1>
        </div>

        {/* Add drop shadows to filter, sort and view controls */}
        <div className="mb-6 relative">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-4 pr-14 rounded-[10px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                // Trigger search functionality when Enter is pressed
                if (searchTerm.trim()) {
                  setCurrentPage(1)
                }
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              if (searchTerm.trim()) {
                setCurrentPage(1)
              }
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-0 h-6 w-6 bg-transparent hover:bg-transparent"
          >
            <Search className="h-6 w-6 text-black dark:text-white" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[180px]">
            <Button
              onClick={() => setShowFilters(!showFilters)}
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

            {showFilters && (
              <div className="mt-2 p-4 border-[1px] border-black dark:border-white rounded-[10px] bg-white dark:bg-black shadow-md">
                <div className="mb-4 grid grid-cols-5 gap-2">
                  {(["genre", "director", "year", "actor", "id"] as FilterType[]).map((type) => (
                    <div key={type} className="flex flex-col items-center">
                      <Switch
                        id={`filter-toggle-${type}-lib`}
                        checked={activeFilterTypes.includes(type)}
                        onCheckedChange={() => {
                          // Use the toggleFilterType function which already has the logic
                          toggleFilterType(type)
                        }}
                      />
                      <Label htmlFor={`filter-toggle-${type}-lib`} className="mt-1 text-xs sm:text-sm cursor-pointer">
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
                            {filteredGenres.map((genre) => {
                              // Count films with this genre
                              const count = films.filter((film) => film.genre === genre).length
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
                            {filteredDirectors.map((director) => {
                              // Count films with this director
                              const count = films.filter((film) => film.director === director).length
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
                            {filteredYears.map((year) => {
                              // Count films with this year
                              const count = films.filter((film) => film.year === year).length
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
                            {filteredActors.map((actor) => {
                              // Count films with this actor
                              const count = films.filter((film) =>
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
                            {filteredIds.map((id) => {
                              // Count films with this ID (should be 1 but just in case)
                              const count = films.filter((film) => film.idNumber === id).length
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
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-12 w-full rounded-[10px] border-[1px] border-black dark:border-white bg-primary dark:bg-black text-primary-foreground dark:text-white card-shadow px-3 appearance-none text-sm"
                >
                  <option value="" disabled>
                    Sort
                  </option>
                  <option value="title">Title (A-Z)</option>
                  <option value="titleDesc">Title (Z-A)</option>
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
                  className={`p-2 rounded-md ${viewMode === "grid" ? "text-lime-green" : "text-white hover:text-white/80"} transition-colors`}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={20} />
                </button>
                <button
                  onClick={toggleViewMode}
                  className={`p-2 rounded-md ${viewMode === "list" ? "text-lime-green" : "text-white hover:text-white/80"} transition-colors`}
                  aria-label="List view"
                >
                  <IconList size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedFilms.length > 0 ? (
          <>
            {initialLoading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingAnimation />
              </div>
            ) : viewMode === "grid" ? (
              <div className="space-y-12">
                {paginatedFilms.length > 0 ? (
                  groupedFilmsForGrid.map(([letter, films]) => (
                    <div key={letter} className="relative pt-2">
                      <h2 className="text-5xl font-bold text-gray-300 mb-6 sticky top-0 bg-white dark:bg-gray-950 py-3 z-10">
                        {letter}
                      </h2>
                      {renderVirtualizedGrid()}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4">No films match your filters</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedFilms || {}).map(([letter, films]) => (
                  <div key={letter} className="space-y-2 relative">
                    <h2 className="text-4xl font-bold text-gray-300 mb-4 sticky top-0 bg-white dark:bg-gray-950 py-2 z-10">
                      {letter}
                    </h2>
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
                            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-b-[20px] mt-[-10px] overflow-hidden transition-all duration-500 ease-in-out"
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
            )}

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
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-[20px]">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Your film library is empty</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Add some films to get started</p>
            <Button onClick={() => router.push("/dashboard/add")} className="mt-4 bg-coral hover:bg-coral-hover">
              Add your first film
            </Button>
          </div>
        )}
      </div>

      <NavigationBar active="library" />

      {showModal && selectedFilm && <FilmModal film={selectedFilm} onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default LibraryScreen

