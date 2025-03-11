"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Movie quotes for the loading messages
const MOVIE_QUOTES = [
  "Hasta la vista, baby!",
  "Meat's back on the menu, boys!",
  "May the Force be with you.",
  "I'll be back.",
  "Here's looking at you, kid.",
  "You're gonna need a bigger boat.",
  "Life is like a box of chocolates.",
  "I see dead people.",
  "There's no place like home.",
  "Houston, we have a problem.",
  "I am your father.",
  "E.T. phone home.",
  "You shall not pass!",
  "My precious...",
  "Why so serious?",
  "To infinity and beyond!",
  "Just keep swimming.",
  "I'm the king of the world!",
  "They call it a Royale with cheese.",
  "You talking to me?",
]

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const router = useRouter()
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const quoteIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Show skip button after a delay
  useEffect(() => {
    skipTimeoutRef.current = setTimeout(() => {
      setShowSkip(true)
    }, 2000)

    return () => {
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current)
    }
  }, [])

  // Progress bar animation
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down progress as it approaches 100%
        const increment = Math.max(0.5, (100 - prev) / 50)
        const newProgress = prev + increment

        // Auto-complete after reaching 98%
        if (newProgress >= 98) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
          setTimeout(() => {
            setProgress(100)
            handleComplete()
          }, 500)
          return 98
        }

        return newProgress
      })
    }, 100)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  // Rotate through movie quotes
  useEffect(() => {
    quoteIntervalRef.current = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOVIE_QUOTES.length)
    }, 3000)

    return () => {
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current)
    }
  }, [])

  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(() => {
      // Check if user has already logged in
      const remembered = localStorage.getItem("filmDbRememberMe") === "true"
      const storedUser = localStorage.getItem("filmDbUser")

      if (remembered && storedUser) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    }, 1000)
  }

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(() => {
      // Check if user has already logged in
      const remembered = localStorage.getItem("filmDbRememberMe") === "true"
      const storedUser = localStorage.getItem("filmDbUser")

      if (remembered && storedUser) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    }, 500)
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(to bottom, #000000, #121212)",
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Main content container */}
      <div className="relative flex flex-col items-center justify-center max-w-md w-full px-6">
        {/* Center logo/animation */}
        <div className="relative z-10 mb-12">
          <svg width="120" height="120" viewBox="0 0 48 49" className="text-red-600 animate-pulse">
            <g clipPath="url(#clip0_72_930)">
              <path
                d="M42.7061 32.4708C43.6428 30.283 44.2005 27.9578 44.4237 25.5826L47.9136 25.7818C48.034 25.8654 47.9968 26.2751 47.9872 26.427C47.9295 27.3595 47.6759 28.5871 47.4691 29.5105C47.1382 30.9872 46.65 32.4558 46.025 33.8334L42.7061 32.4708Z"
                fill="currentColor"
              />
              <path
                d="M15.8067 42.8872L14.4077 46.2458C12.4832 45.4115 10.5151 44.2939 8.89336 42.9576C8.73154 42.8244 8.12793 42.3575 8.12793 42.1993C8.12793 42.0228 10.1715 39.845 10.4919 39.5945C12.1319 40.8816 13.8391 42.1415 15.8072 42.8872H15.8067Z"
                fill="currentColor"
              />
              <path
                d="M5.08753 16.1433C4.32665 18.1539 3.75986 20.2317 3.56759 22.3841L0 21.989C0.195902 19.5374 0.774062 17.0981 1.76357 14.8494L5.08753 16.1438V16.1433Z"
                fill="currentColor"
              />
              <path
                d="M37.3311 8.44224C37.1329 8.55727 36.1698 7.67658 35.9284 7.5079C34.6198 6.59357 33.239 5.81792 31.7754 5.1732L33.1085 1.89417C34.9085 2.53979 36.7084 3.5696 38.2497 4.70581C38.4315 4.83993 39.4083 5.5583 39.4683 5.6506C39.5237 5.73653 39.5242 5.80791 39.4669 5.89157L37.3315 8.44224H37.3311Z"
                fill="currentColor"
              />
              <path
                d="M44.5369 11.5062C45.7359 13.6313 46.7836 15.8619 47.3354 18.2534L47.0463 18.4399L43.8769 19.1882C43.3001 17.1491 42.5083 15.1963 41.4238 13.374L41.5056 13.2189L44.1669 11.5571L44.5369 11.5062Z"
                fill="currentColor"
              />
              <path
                d="M28.3761 44.162L29.0897 47.6729C26.6848 48.2067 24.1399 48.4413 21.6909 48.0885L22.0514 44.5953C23.2804 44.5689 24.4585 44.6648 25.6976 44.5598C26.6003 44.483 27.4843 44.307 28.3761 44.162Z"
                fill="currentColor"
              />
              <path
                d="M39.2359 37.8445C39.5904 38.0509 41.9308 40.0887 41.8999 40.2669C40.2299 42.1015 38.2914 43.6533 36.1828 44.9532L34.3179 41.8783C36.1051 40.7121 37.7691 39.3985 39.2359 37.8445Z"
                fill="currentColor"
              />
              <path
                d="M8.59777 10.6842L8.21369 10.5714L5.73242 8.41356C7.37372 6.52625 9.27092 4.82535 11.4536 3.58093L13.318 6.57262C12.3599 7.34828 11.2931 7.98936 10.37 8.8123C9.75727 9.35881 9.10684 10.0535 8.59777 10.6832V10.6842Z"
                fill="currentColor"
              />
              <path
                d="M0.532715 29.5163L3.97122 28.7416C4.58483 30.7412 5.19936 32.7694 6.35931 34.5285L6.33613 34.634L3.24579 36.4395C2.01857 34.2862 0.968607 31.9747 0.532715 29.5163Z"
                fill="currentColor"
              />
              <path
                d="M19.1758 4.21111L18.3745 0.688829C19.7254 0.416485 21.1153 0.124591 22.4975 0.0482075C23.2943 0.00410511 24.6065 -0.033632 25.3779 0.0477529C25.5479 0.0654848 25.722 0.101858 25.8642 0.202793C25.7074 1.34946 25.7774 2.58432 25.5033 3.69552C24.6665 3.67415 23.8175 3.60641 22.978 3.65097C21.7021 3.71871 20.4263 3.98151 19.1758 4.21111Z"
                fill="currentColor"
              />
              <path
                d="M23.8967 6.38672C14.0607 6.38672 6.0874 14.3624 6.0874 24.2014C6.0874 34.0403 14.0607 42.016 23.8967 42.016C33.7327 42.016 41.7061 34.0403 41.7061 24.2014C41.7061 14.3624 33.7327 6.38672 23.8967 6.38672Z"
                fill="currentColor"
              />
              <circle cx="24" cy="24" r="8" fill="currentColor" />
            </g>
            <defs>
              <clipPath id="clip0_72_930">
                <rect width="48" height="48.2567" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Film strip progress bar */}
        <div className="w-full max-w-md mx-auto mb-6 relative">
          {/* Film strip container */}
          <div className="relative h-8 bg-black rounded-md overflow-hidden flex items-center">
            {/* Left perforations */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-black z-10 flex flex-col justify-between py-1">
              {[...Array(4)].map((_, i) => (
                <div key={`left-${i}`} className="w-2 h-2 rounded-full bg-gray-800 mx-auto"></div>
              ))}
            </div>

            {/* Right perforations */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-black z-10 flex flex-col justify-between py-1">
              {[...Array(4)].map((_, i) => (
                <div key={`right-${i}`} className="w-2 h-2 rounded-full bg-gray-800 mx-auto"></div>
              ))}
            </div>

            {/* Film frames */}
            <div className="flex-1 mx-3 flex">
              {[...Array(10)].map((_, i) => {
                const frameProgress = (i + 1) * 10
                const isActive = progress >= frameProgress
                return (
                  <div
                    key={`frame-${i}`}
                    className={`flex-1 h-6 mx-0.5 transition-colors duration-300 ease-out ${
                      isActive ? "bg-red-600" : "bg-gray-800"
                    }`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Movie quote */}
        <div className="h-8 text-center">
          <p
            className="text-white text-lg font-medium"
            style={{
              textShadow: "0 0 10px rgba(255, 0, 0, 0.3)",
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            {MOVIE_QUOTES[quoteIndex]}
          </p>
        </div>
      </div>

      {/* Skip button - moved to the very bottom of the screen */}
      {showSkip && (
        <div className="fixed bottom-2 w-full flex justify-center">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-transparent animate-pulse"
          >
            Skip
          </Button>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

