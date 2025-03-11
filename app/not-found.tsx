"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [glowIntensity, setGlowIntensity] = useState(0)

  useEffect(() => {
    // Pulsing effect for the red eye
    const pulseInterval = setInterval(() => {
      setGlowIntensity((prev) => {
        // Dramatic sine wave for obvious pulsing
        return Math.sin(Date.now() / 500) * 0.5 + 0.5 // Value between 0 and 1
      })
    }, 30)

    return () => clearInterval(pulseInterval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="relative w-32 h-32 mb-8">
        {/* Red glowing "eye" with pulsing effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,0,0,${0.2 + glowIntensity * 0.3}) 0%, transparent 70%)`,
            transform: `scale(${1 + glowIntensity * 0.2})`,
            opacity: 0.6 + glowIntensity * 0.4,
            transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-full bg-red-600"
            style={{
              boxShadow: `0 0 ${10 + glowIntensity * 20}px rgba(255,0,0,${0.4 + glowIntensity * 0.4})`,
              transition: "box-shadow 0.1s ease-out",
            }}
          />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">404 - Page Not Found</h1>

      <p
        className="text-xl md:text-2xl mb-8 text-center"
        style={{
          color: `rgba(255,0,0,${0.8 + glowIntensity * 0.2})`,
          textShadow: `0 0 ${5 + glowIntensity * 10}px rgba(255,0,0,${0.3 + glowIntensity * 0.3})`,
        }}
      >
        I&apos;m afraid I can&apos;t do this.
      </p>

      <Link href="/dashboard">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg"
          style={{
            boxShadow: `0 0 ${5 + glowIntensity * 10}px rgba(255,0,0,${0.3 + glowIntensity * 0.3})`,
          }}
        >
          Return to Dashboard
        </Button>
      </Link>
    </div>
  )
}

