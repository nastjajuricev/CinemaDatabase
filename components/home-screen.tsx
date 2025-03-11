"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useFilmDatabase } from "@/app/providers"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { Film } from "@/lib/types"
import { useFilms } from "@/lib/use-films"
import NavigationBar from "@/components/navigation-bar"
import { Search, AlertCircle } from "lucide-react"
import * as React from "react"
import ThemeToggle from "./theme-toggle"
import { isDropboxKeyConfigured } from "@/lib/dropbox-integration"
import dynamic from "next/dynamic"

type ExtendedStats = {
  totalFilms: number
  daysSinceLastAdded: number
  storageUsed: {
    size: string
    percentage: number
  }
  mostAddedGenre: {
    genre: string
    count: number
  }
}

const FilmModal = dynamic(() => import("@/components/film-modal"), {
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-12 h-12 border-t-2 border-b-2 border-coral rounded-full animate-spin"></div>
    </div>
  ),
  ssr: false,
})

export default function HomeScreen() {
  const { user } = useFilmDatabase()
  const router = useRouter()
  const { films, lastSearched, lastAdded, searchHistory, searchFilms } = useFilms()
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [showKeyWarning, setShowKeyWarning] = useState(false)

  const statsRef = useRef<HTMLDivElement>(null)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowStats(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Check if Dropbox key is configured when the component mounts
  useEffect(() => {
    const keyConfigured = isDropboxKeyConfigured()
    setShowKeyWarning(!keyConfigured)

    if (!keyConfigured) {
      console.warn("Dropbox API key is not configured. Some features may not work properly.")
    }
  }, [])

  // Set isLoaded to true after a short delay to trigger animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Calculate extended stats
  const stats: ExtendedStats = React.useMemo(() => {
    if (films.length === 0) {
      return {
        totalFilms: 0,
        daysSinceLastAdded: 0,
        storageUsed: {
          size: "0 MB",
          percentage: 0,
        },
        mostAddedGenre: {
          genre: "None",
          count: 0,
        },
      }
    }

    // Calculate days since last added
    const dates = films.map((film) => new Date(film.dateAdded).getTime())
    const mostRecent = new Date(Math.max(...dates))
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - mostRecent.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Calculate most added genre
    const genreCounts: Record<string, number> = {}
    let maxGenre = "None"
    let maxCount = 0

    films.forEach((film) => {
      const genre = film.genre || "Uncategorized"
      genreCounts[genre] = (genreCounts[genre] || 0) + 1

      if (genreCounts[genre] > maxCount) {
        maxGenre = genre
        maxCount = genreCounts[genre]
      }
    })

    // Calculate storage used (estimate based on average image size)
    const averageImageSize = 2 * 1024 * 1024 // 2MB per image
    const totalSize = films.length * averageImageSize
    const maxStorage = 100 * 1024 * 1024 * 1024 // 100GB max storage
    const percentage = (totalSize / maxStorage) * 100

    // Format size string
    let sizeString
    if (totalSize > 1024 * 1024 * 1024) {
      sizeString = `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
    } else if (totalSize > 1024 * 1024) {
      sizeString = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
    } else {
      sizeString = `${(totalSize / 1024).toFixed(1)} KB`
    }

    return {
      totalFilms: films.length,
      daysSinceLastAdded: diffDays,
      storageUsed: {
        size: sizeString,
        percentage: Number(percentage.toFixed(1)),
      },
      mostAddedGenre: {
        genre: maxGenre,
        count: maxCount,
      },
    }
  }, [films])

  const handleFilmClick = (film: Film) => {
    // Make sure we're using the latest version of the film from the films array
    const latestFilm = films.find((f) => f.id === film.id) || film
    setSelectedFilm(latestFilm)
    setShowModal(true)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Perform a local search to update the search history immediately
      const results = searchFilms(searchTerm)

      // Then navigate to the search page
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <div className="min-h-screen pb-16 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        {/* Header with fade-in animation */}
        <div
          className={`flex justify-between items-center mb-4 transition-opacity duration-700 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <h1 className="text-4xl font-bold pl-2 text-black dark:text-white">Welcome, {user.name}</h1>
          <ThemeToggle />
        </div>

        {/* Dropbox API Key Warning */}
        {showKeyWarning && (
          <div
            className={`bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 rounded-md transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
            style={{ transitionDelay: "50ms" }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dropbox API Key Missing</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    The Dropbox integration requires an API key. Please add the{" "}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">
                      NEXT_PUBLIC_DROPBOX_APP_KEY
                    </code>{" "}
                    environment variable to enable cloud sync.
                  </p>
                  <p className="mt-1">
                    <Link href="/dashboard/settings" className="font-medium underline">
                      Go to Settings
                    </Link>{" "}
                    for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons with slide-in animation */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <Link href="/dashboard/add">
            <Button className="w-full h-16 text-xl bg-coral hover:bg-coral-hover rounded-[15px] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              Add film
            </Button>
          </Link>
          <Link href="/dashboard/library">
            <Button
              variant="outline"
              className="w-full h-16 text-xl border-2 border-black dark:border-white text-black dark:text-white rounded-[15px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              View Library
            </Button>
          </Link>
        </div>

        {/* Search form with slide-in animation */}
        <form
          onSubmit={handleSearch}
          className={`mb-4 transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="relative">
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-3 pr-12 text-base rounded-[15px] border-2 border-black dark:border-gray-600 transition-all duration-300 focus:shadow-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (searchTerm.trim()) {
                    router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`)
                  }
                }
              }}
            />
            <Button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-0 h-6 w-6 bg-transparent hover:bg-transparent"
            >
              <Search className="h-6 w-6 text-black dark:text-white" />
            </Button>
          </div>
        </form>

        {/* Last searches section with fade-in animation */}
        <section
          className={`mb-4 transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black dark:text-white">Last 5 searches</h2>
          </div>
          <div className="overflow-x-auto pb-4 -mx-6 px-6 smooth-scroll">
            <div className="flex space-x-4 flex-nowrap">
              {searchHistory && searchHistory.length > 0 ? (
                searchHistory.map((search, index) => (
                  <div
                    key={search.id}
                    onClick={() => router.push(`/dashboard/search?q=${encodeURIComponent(search.term)}`)}
                    className={`bg-coral dark:bg-[#D25B36] rounded-[15px] p-3 cursor-pointer hover:scale-[1.05] transition-all duration-300 relative overflow-hidden group flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] transform transition-opacity ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{
                      boxShadow: "0 4px 10px rgba(255, 127, 80, 0.5)",
                      transitionDelay: `${300 + index * 100}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-red-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="flex flex-col h-full justify-center text-center">
                      <h3 className="font-medium text-lg mb-2 truncate relative z-10 text-white">"{search.term}"</h3>
                      <p className="text-sm text-white text-opacity-80 relative z-10">
                        {search.resultCount} {search.resultCount === 1 ? "result" : "results"} found
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  className={`text-gray-500 dark:text-gray-400 italic transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                >
                  No recent searches
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Last added section with fade-in animation */}
        <section
          className={`mb-4 transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black dark:text-white">Last 5 added</h2>
          </div>
          <div className="overflow-x-auto pb-4 -mx-6 px-6 smooth-scroll">
            {lastAdded.length > 0 ? (
              <div className="flex space-x-4 flex-nowrap">
                {lastAdded.map((film, index) => (
                  <div
                    key={film.id}
                    onClick={() => handleFilmClick(film)}
                    className={`bg-lime-green-light bg-opacity-50 dark:bg-lime-green-dark dark:bg-opacity-50 rounded-[15px] p-3 cursor-pointer hover:scale-[1.05] transition-all duration-300 relative overflow-hidden group lime-shadow flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] transform transition-opacity ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-green-light to-lime-green-dark opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="aspect-square relative rounded-[15px] overflow-hidden mb-2 transform transition-all duration-300 group-hover:scale-[1.02]">
                      <Image
                        src={film.imageUrl || "/placeholder.svg"}
                        alt={film.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <h3 className="font-medium truncate text-black dark:text-white">{film.title}</h3>
                      <span className="text-sm text-black dark:text-gray-300">#{film.idNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-[20px] w-full transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
              >
                <p className="text-gray-500 dark:text-gray-400">No films added yet</p>
                <Button
                  onClick={() => router.push("/dashboard/add")}
                  className="mt-4 bg-coral hover:bg-coral-hover transition-all duration-300 hover:scale-105"
                >
                  Add your first film
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Stats section with fade-in animation */}
        <section
          ref={statsRef}
          className={`transition-all duration-700 ease-out ${isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          {showStats && (
            <>
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Films in storage", value: stats.totalFilms, unit: "" },
                  { title: "Days since last added", value: stats.daysSinceLastAdded, unit: "" },
                  {
                    title: "Most Added Genre",
                    value: stats.mostAddedGenre.genre,
                    unit: `(${stats.mostAddedGenre.count} films)`,
                  },
                  { title: "Storage Used", value: stats.storageUsed.percentage, unit: `(${stats.storageUsed.size})` },
                ].map((stat, index) => (
                  <div
                    key={stat.title}
                    className={`bg-gray-100 dark:bg-gray-800 rounded-[15px] p-4 text-center transform transition-all duration-500 hover:shadow-lg hover:scale-[1.02] ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${500 + index * 100}ms` }}
                  >
                    <h3 className="text-base mb-1 text-gray-700 dark:text-gray-300">{stat.title}</h3>
                    <p className="text-3xl font-bold text-black dark:text-white">
                      {typeof stat.value === "string" ? stat.value : stat.value}
                    </p>
                    {stat.unit && <p className="text-sm text-gray-600 dark:text-gray-400">{stat.unit}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <NavigationBar active="home" />

      {showModal && selectedFilm && <FilmModal film={selectedFilm} onClose={() => setShowModal(false)} />}
    </div>
  )
}

