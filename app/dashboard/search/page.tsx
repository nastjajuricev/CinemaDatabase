"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "../../providers"
import SearchScreen from "@/components/search-screen"

export default function Search() {
  const { user } = useFilmDatabase()
  const router = useRouter()

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push("/")
    }
  }, [user, router])

  if (!user.isLoggedIn) {
    return null
  }

  return <SearchScreen />
}

