"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "../../providers"
import AddFilmScreen from "@/components/add-film-screen"

export default function AddFilm() {
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

  return <AddFilmScreen />
}

