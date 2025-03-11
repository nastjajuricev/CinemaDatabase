"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthScreen from "@/components/auth-screen"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Function to detect if device is mobile
    const isMobileDevice = () => {
      return (
        typeof window !== "undefined" &&
        (window.innerWidth <= 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      )
    }

    // Check if this is the first visit or a mobile device
    const hasVisited = localStorage.getItem("hasVisitedBefore")
    const isMobile = isMobileDevice()

    if (!hasVisited || isMobile) {
      // First time visitor or mobile device, show loading screen
      localStorage.setItem("hasVisitedBefore", "true")
      router.push("/loading")
    }
    // Otherwise, continue to auth screen
  }, [router])

  return <AuthScreen />
}

