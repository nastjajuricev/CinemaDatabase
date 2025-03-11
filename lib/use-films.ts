"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Film, Stats, SearchEntry } from "./types"

// Mock data for demonstration
const initialFilms: Film[] = []

// Mock Dropbox functions (replace with actual implementation)
const isDropboxAuthenticated = () => {
  // Replace with your actual Dropbox authentication check
  return false
}

const loadFilmsFromDropbox = async () => {
  // Replace with your actual Dropbox data loading logic
  return null
}

const saveFilmsToDropbox = async (films: Film[]) => {
  // Replace with your actual Dropbox data saving logic
}

const loadLastSearchedFromDropbox = async () => {
  // Replace with your actual Dropbox data loading logic
  return null
}

const saveLastSearchedToDropbox = async (lastSearched: Film[]) => {
  // Replace with your actual Dropbox data saving logic
}

const loadLastAddedFromDropbox = async () => {
  // Replace with your actual Dropbox data loading logic
  return null
}

const saveLastAddedToDropbox = async (lastAdded: Film[]) => {
  // Replace with your actual Dropbox data saving logic
}

export function useFilms() {
  const [films, setFilms] = useState<Film[]>([])
  const [lastSearched, setLastSearched] = useState<Film[]>([])
  const [lastAdded, setLastAdded] = useState<Film[]>([])
  const [stats, setStats] = useState<Stats>({
    totalFilms: 0,
    daysSinceLastAdded: 0,
  })
  const [searchHistory, setSearchHistory] = useState<SearchEntry[]>([])

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true)

  // Initialize with data from localStorage or Dropbox
  useEffect(() => {
    const loadData = async () => {
      // First check if we're authenticated with Dropbox
      const isDropboxAuth = isDropboxAuthenticated()

      if (isDropboxAuth) {
        try {
          // Try to load from Dropbox first
          const dropboxFilms = await loadFilmsFromDropbox()
          if (dropboxFilms) {
            setFilms(dropboxFilms)
          } else {
            // If no Dropbox data, fall back to localStorage
            const storedFilms = localStorage.getItem("films")
            if (storedFilms) {
              setFilms(JSON.parse(storedFilms))
              // Also save to Dropbox for future use
              saveFilmsToDropbox(JSON.parse(storedFilms))
            } else {
              setFilms(initialFilms)
              localStorage.setItem("films", JSON.stringify(initialFilms))
              saveFilmsToDropbox(initialFilms)
            }
          }

          // Load last searched from Dropbox
          const dropboxLastSearched = await loadLastSearchedFromDropbox()
          if (dropboxLastSearched) {
            setLastSearched(dropboxLastSearched)
          } else {
            const storedLastSearched = localStorage.getItem("lastSearched")
            if (storedLastSearched) {
              setLastSearched(JSON.parse(storedLastSearched))
              saveLastSearchedToDropbox(JSON.parse(storedLastSearched))
            }
          }

          // Load last added from Dropbox
          const dropboxLastAdded = await loadLastAddedFromDropbox()
          if (dropboxLastAdded) {
            setLastAdded(dropboxLastAdded)
          } else {
            const storedLastAdded = localStorage.getItem("lastAdded")
            if (storedLastAdded) {
              setLastAdded(JSON.parse(storedLastAdded))
              saveLastAddedToDropbox(JSON.parse(storedLastAdded))
            }
          }
        } catch (error) {
          console.error("Error loading data from Dropbox:", error)
          // Fall back to localStorage
          loadFromLocalStorage()
        }
      } else {
        // Not authenticated with Dropbox, use localStorage
        loadFromLocalStorage()
      }

      // Load search history from localStorage
      const storedSearchHistory = localStorage.getItem("searchHistory")
      if (storedSearchHistory) {
        setSearchHistory(JSON.parse(storedSearchHistory))
      } else {
        // Initialize with empty array if not found
        localStorage.setItem("searchHistory", JSON.stringify([]))
      }
    }

    const loadFromLocalStorage = () => {
      const storedFilms = localStorage.getItem("films")
      if (storedFilms) {
        setFilms(JSON.parse(storedFilms))
      } else {
        setFilms(initialFilms)
        localStorage.setItem("films", JSON.stringify(initialFilms))
      }

      const storedLastSearched = localStorage.getItem("lastSearched")
      if (storedLastSearched) {
        setLastSearched(JSON.parse(storedLastSearched))
      } else {
        // Initialize with empty array if not found
        localStorage.setItem("lastSearched", JSON.stringify([]))
      }

      const storedLastAdded = localStorage.getItem("lastAdded")
      if (storedLastAdded) {
        setLastAdded(JSON.parse(storedLastAdded))
      } else {
        // Initialize with first 5 films if not found
        const initialLastAdded = initialFilms.slice(0, 5)
        setLastAdded(initialLastAdded)
        localStorage.setItem("lastAdded", JSON.stringify(initialLastAdded))
      }

      const storedSearchHistory = localStorage.getItem("searchHistory")
      if (storedSearchHistory) {
        setSearchHistory(JSON.parse(storedSearchHistory))
      } else {
        // Initialize with empty array if not found
        localStorage.setItem("searchHistory", JSON.stringify([]))
      }
    }

    loadData()
  }, [])

  // Update stats whenever films change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Handle empty films case
    if (films.length === 0) {
      setStats({
        totalFilms: 0,
        daysSinceLastAdded: 0,
      })
      setLastAdded([])
      localStorage.setItem("lastAdded", JSON.stringify([]))
      return
    }

    // Calculate stats
    const totalFilms = films.length
    let daysSinceLastAdded = 0

    try {
      const dates = films.map((film) => new Date(film.dateAdded).getTime())
      const mostRecent = new Date(Math.max(...dates))
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - mostRecent.getTime())
      daysSinceLastAdded = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch (e) {
      console.error("Error calculating dates:", e)
    }

    // Update stats
    setStats({ totalFilms, daysSinceLastAdded })

    // Update last added (simple approach)
    try {
      const sortedByDate = [...films].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      const newLastAdded = sortedByDate.slice(0, 5)
      setLastAdded(newLastAdded)
      localStorage.setItem("lastAdded", JSON.stringify(newLastAdded))
    } catch (e) {
      console.error("Error updating last added:", e)
    }
  }, [films])

  // Update the addFilm function to handle image files
  const addFilm = useCallback((filmData: Omit<Film, "id" | "dateAdded">) => {
    // Handle image file if present
    if (filmData.imageFile) {
      // In a real app with a backend, you would upload the file here
      // For this demo, we'll keep the blob URL
      console.log("Would upload image file in a real app:", filmData.imageFile.name)

      // Remove the file before storing in localStorage (can't serialize File objects)
      const { imageFile, ...filmDataWithoutFile } = filmData

      const newFilm: Film = {
        ...filmDataWithoutFile,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString(),
      }

      setFilms((prevFilms) => {
        const updatedFilms = [newFilm, ...prevFilms]
        localStorage.setItem("films", JSON.stringify(updatedFilms))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveFilmsToDropbox(updatedFilms)
        }

        return updatedFilms
      })

      // Update last added
      setLastAdded((prevLastAdded) => {
        const newLastAdded = [newFilm, ...prevLastAdded].slice(0, 5)
        localStorage.setItem("lastAdded", JSON.stringify(newLastAdded))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveLastAddedToDropbox(newLastAdded)
        }

        return newLastAdded
      })
    } else {
      // Original code for when no file is present
      const newFilm: Film = {
        ...filmData,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString(),
      }

      setFilms((prevFilms) => {
        const updatedFilms = [newFilm, ...prevFilms]
        localStorage.setItem("films", JSON.stringify(updatedFilms))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveFilmsToDropbox(updatedFilms)
        }

        return updatedFilms
      })

      // Update last added
      setLastAdded((prevLastAdded) => {
        const newLastAdded = [newFilm, ...prevLastAdded].slice(0, 5)
        localStorage.setItem("lastAdded", JSON.stringify(newLastAdded))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveLastAddedToDropbox(newLastAdded)
        }

        return newLastAdded
      })
    }
  }, [])

  const addFilms = useCallback((filmsData: Omit<Film, "id" | "dateAdded">[]) => {
    const newFilms = filmsData.map((filmData) => ({
      ...filmData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString(),
    }))

    setFilms((prevFilms) => {
      const updatedFilms = [...newFilms, ...prevFilms]
      localStorage.setItem("films", JSON.stringify(updatedFilms))

      // Sync with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveFilmsToDropbox(updatedFilms)
      }

      return updatedFilms
    })

    // Update last added
    setLastAdded((prevLastAdded) => {
      const newLastAdded = [...newFilms, ...prevLastAdded].slice(0, 5)
      localStorage.setItem("lastAdded", JSON.stringify(newLastAdded))

      // Sync last added with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveLastAddedToDropbox(newLastAdded)
      }

      return newLastAdded
    })
  }, [])

  const deleteFilm = useCallback((id: string) => {
    setFilms((prevFilms) => {
      const updatedFilms = prevFilms.filter((film) => film.id !== id)
      localStorage.setItem("films", JSON.stringify(updatedFilms))

      // Sync with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveFilmsToDropbox(updatedFilms)
      }

      return updatedFilms
    })

    // Update last added and last searched
    setLastAdded((prevLastAdded) => {
      const updatedLastAdded = prevLastAdded.filter((film) => film.id !== id)
      localStorage.setItem("lastAdded", JSON.stringify(updatedLastAdded))

      // Sync with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveLastAddedToDropbox(updatedLastAdded)
      }

      return updatedLastAdded
    })

    setLastSearched((prevLastSearched) => {
      const updatedLastSearched = prevLastSearched.filter((film) => film.id !== id)
      localStorage.setItem("lastSearched", JSON.stringify(updatedLastSearched))

      // Sync with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveLastSearchedToDropbox(updatedLastSearched)
      }

      return updatedLastSearched
    })
  }, [])

  // Helper function to update last searched - memoized to prevent recreation on each render
  const updateLastSearched = useCallback((results: Film[]) => {
    setLastSearched((prevLastSearched) => {
      const newLastSearched = [...results, ...prevLastSearched]
        .filter((film, index, self) => self.findIndex((f) => f.id === film.id) === index)
        .slice(0, 5)

      localStorage.setItem("lastSearched", JSON.stringify(newLastSearched))

      // Sync with Dropbox if connected
      if (isDropboxAuthenticated()) {
        saveLastSearchedToDropbox(newLastSearched)
      }

      return newLastSearched
    })
  }, [])

  // Add a new helper function to update search history - memoized
  const updateSearchHistory = useCallback((term: string, resultCount: number) => {
    // Create a new search entry
    const newEntry: SearchEntry = {
      id: Date.now().toString(),
      term,
      resultCount,
      timestamp: new Date().toISOString(),
    }

    // Update search history - add new entry at the beginning and remove duplicates
    setSearchHistory((prevSearchHistory) => {
      const updatedHistory = [newEntry, ...prevSearchHistory]
        .filter(
          (entry, index, self) => index === self.findIndex((e) => e.term.toLowerCase() === entry.term.toLowerCase()),
        )
        .slice(0, 5) // Keep only the 5 most recent searches

      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))

      return updatedHistory
    })
  }, [])

  // Add a caching mechanism for search results - memoized
  const searchFilms = useCallback(
    (term: string) => {
      if (!term.trim()) return []

      // Check cache first
      const cacheKey = `search_${term.toLowerCase()}`
      const cachedResults = sessionStorage.getItem(cacheKey)

      if (cachedResults) {
        const parsedResults = JSON.parse(cachedResults)
        // Update last searched without re-searching
        updateLastSearched(parsedResults)

        // Update search history
        updateSearchHistory(term, parsedResults.length)

        return parsedResults
      }

      // Perform the search if not cached
      const results = films.filter((film) => {
        const searchableText = `${film.title} ${film.director} ${film.actors} ${film.genre} ${film.tags}`.toLowerCase()
        return searchableText.includes(term.toLowerCase())
      })

      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify(results))

      // Update last searched
      updateLastSearched(results)

      // Update search history
      updateSearchHistory(term, results.length)

      return results
    },
    [films, updateLastSearched, updateSearchHistory],
  )

  // Update the updateFilm function to ensure it always returns the updated film
  const updateFilm = useCallback(
    (id: string, filmData: Omit<Film, "id" | "dateAdded">) => {
      // Find the film to update
      const filmToUpdate = films.find((film) => film.id === id)

      if (!filmToUpdate) {
        console.error("Film not found with ID:", id)
        return null
      }

      // Create the updated film object
      const updatedFilm = {
        ...filmToUpdate,
        ...filmData,
      }

      // Update films state
      setFilms((prevFilms) => {
        // Create a new array with the updated film
        const updatedFilms = prevFilms.map((film) => {
          if (film.id === id) {
            return updatedFilm
          }
          return film
        })

        // Update localStorage
        localStorage.setItem("films", JSON.stringify(updatedFilms))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveFilmsToDropbox(updatedFilms)
        }

        return updatedFilms
      })

      // Update last added if needed
      setLastAdded((prevLastAdded) => {
        const updatedLastAdded = prevLastAdded.map((film) => {
          if (film.id === id) {
            return updatedFilm
          }
          return film
        })

        localStorage.setItem("lastAdded", JSON.stringify(updatedLastAdded))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveLastAddedToDropbox(updatedLastAdded)
        }

        return updatedLastAdded
      })

      // Update last searched if needed
      setLastSearched((prevLastSearched) => {
        const updatedLastSearched = prevLastSearched.map((film) => {
          if (film.id === id) {
            return updatedFilm
          }
          return film
        })

        localStorage.setItem("lastSearched", JSON.stringify(updatedLastSearched))

        // Sync with Dropbox if connected
        if (isDropboxAuthenticated()) {
          saveLastSearchedToDropbox(updatedLastSearched)
        }

        return updatedLastSearched
      })

      // Return the updated film object so it can be used by the caller
      return updatedFilm
    },
    [films],
  )

  // Update the return statement to include updateFilm
  return {
    films,
    lastSearched,
    lastAdded,
    stats,
    searchHistory,
    addFilm,
    addFilms,
    deleteFilm,
    searchFilms,
    updateFilm,
  }
}

