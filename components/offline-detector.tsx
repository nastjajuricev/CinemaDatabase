"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center">
      <div className="bg-yellow-500 text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <WifiOff size={16} />
        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
      </div>
    </div>
  )
}

