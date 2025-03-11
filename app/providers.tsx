"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { ThemeProvider } from "@/lib/theme-context"

type User = {
  name: string
  isLoggedIn: boolean
}

type FilmDatabaseContextType = {
  user: User
  login: (name: string, password: string, remember?: boolean) => void
  logout: () => void
}

const FilmDatabaseContext = createContext<FilmDatabaseContextType | undefined>(undefined)

// Change the component name from Providers to FilmDatabaseProvider
// This ensures the component name matches what we're expecting in useFilmDatabase

export function FilmDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ name: "", isLoggedIn: false })

  useEffect(() => {
    // Check if user chose "remember me" previously
    const remembered = localStorage.getItem("filmDbRememberMe") === "true"

    // First check if user is stored in localStorage (for remembered logins)
    const storedUser = localStorage.getItem("filmDbUser")
    if (remembered && storedUser) {
      setUser(JSON.parse(storedUser))
      console.log("User automatically logged in from saved preferences")
    } else {
      // Check session storage for current session login
      const sessionUser = sessionStorage.getItem("filmDbUser")
      if (sessionUser) {
        setUser(JSON.parse(sessionUser))
      }
    }
  }, [])

  const login = (name: string, password: string, remember = false) => {
    // In a real app, you would validate credentials against a backend
    const newUser = { name, isLoggedIn: true }
    setUser(newUser)

    if (remember) {
      // Store user info and the fact that "remember me" was checked
      localStorage.setItem("filmDbUser", JSON.stringify(newUser))
      localStorage.setItem("filmDbRememberMe", "true")
      console.log("User preferences saved for easy login")
    } else {
      // Only store the session, not for future auto-login
      sessionStorage.setItem("filmDbUser", JSON.stringify(newUser))
      localStorage.removeItem("filmDbRememberMe")
    }
  }

  const logout = () => {
    setUser({ name: "", isLoggedIn: false })
    localStorage.removeItem("filmDbUser")
    localStorage.removeItem("filmDbRememberMe")
    sessionStorage.removeItem("filmDbUser")
  }

  return (
    <ThemeProvider>
      <FilmDatabaseContext.Provider value={{ user, login, logout }}>{children}</FilmDatabaseContext.Provider>
    </ThemeProvider>
  )
}

export function useFilmDatabase() {
  const context = useContext(FilmDatabaseContext)
  if (context === undefined) {
    throw new Error("useFilmDatabase must be used within a FilmDatabaseProvider")
  }
  return context
}

// Add an export for the renamed provider to maintain backward compatibility
// This ensures any existing imports of "Providers" still work

export { FilmDatabaseProvider as Providers }

