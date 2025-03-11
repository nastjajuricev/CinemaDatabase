"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "../../providers"
import LibraryScreen from "@/components/library-screen"

export default function Library() {
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

  return <LibraryScreen />
}

