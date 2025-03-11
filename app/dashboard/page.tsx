"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "../providers"
import HomeScreen from "@/components/home-screen"
import LoadingAnimation from "@/components/loading-animation"
import ErrorBoundary from "@/components/error-boundary"

export default function Dashboard() {
  const { user } = useFilmDatabase()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push("/")
    } else {
      // Simulate loading for demonstration
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  if (!user.isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <HomeScreen />
    </ErrorBoundary>
  )
}

