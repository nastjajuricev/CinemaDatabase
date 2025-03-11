"use client"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { useTheme } from "@/lib/theme-context"

export default function LoadingAnimation() {
  const [rotation, setRotation] = useState(0)
  const [pulseIntensity, setPulseIntensity] = useState(0)
  const { theme } = useTheme()
  const [audioPlayed, setAudioPlayed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Determine colors based on theme
  const glowColor =
    theme === "light"
      ? `rgba(255,0,0,${0.05 + pulseIntensity * 0.15})`
      : `rgba(255,0,0,${0.05 + pulseIntensity * 0.15})`

  const textColor =
    theme === "light" ? `rgba(255,0,0,${0.6 + pulseIntensity * 0.2})` : `rgba(255,0,0,${0.6 + pulseIntensity * 0.2})`

  const iconColor = theme === "light" ? "text-red-600" : "text-red-500"

  useEffect(() => {
    // Play HAL9000 sound when component mounts
    if (!audioPlayed && audioRef.current) {
      audioRef.current.volume = 0.3 // Set volume to 30%
      audioRef.current.play().catch((err) => {
        // Handle autoplay restrictions
        console.log("Audio autoplay was prevented:", err)
      })
      setAudioPlayed(true)
    }

    // Slow rotation animation
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360)
    }, 50)

    // More pronounced pulsing effect with less glow
    const pulseInterval = setInterval(() => {
      setPulseIntensity((prev) => {
        // More dramatic sine wave for more obvious pulsing
        const intensity = Math.sin(Date.now() / 500) * 0.5 + 0.5 // Value between 0 and 1
        return intensity
      })
    }, 30)

    return () => {
      clearInterval(rotationInterval)
      clearInterval(pulseInterval)
    }
  }, [audioPlayed])

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/hal9000.mp3" preload="auto" className="hidden" />

      <div className="relative w-48 h-48 mb-4">
        {/* Red background with reduced glow but more dramatic pulsating effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            transform: `scale(${1 + pulseIntensity * 0.4})`, // More dramatic scale change
            opacity: 0.2 + pulseIntensity * 0.4, // Less overall glow
            transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
          }}
        />

        {/* HAL-inspired red "eye" with pulsing effect */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            filter: `drop-shadow(0 0 ${3 + pulseIntensity * 8}px rgba(255,0,0,${0.2 + pulseIntensity * 0.3}))`, // Reduced glow
            transform: `scale(${0.9 + pulseIntensity * 0.2})`, // Add pulse to the icon itself
            transition: "transform 0.1s ease-out",
          }}
        >
          <svg
            width="48"
            height="49"
            viewBox="0 0 48 49"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center",
            }}
            className={`w-32 h-32 ${iconColor}`}
          >
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
              {/* Outer ring */}
              <path
                d="M23.8967 6.38672C14.0607 6.38672 6.0874 14.3624 6.0874 24.2014C6.0874 34.0403 14.0607 42.016 23.8967 42.016C33.7327 42.016 41.7061 34.0403 41.7061 24.2014C41.7061 14.3624 33.7327 6.38672 23.8967 6.38672Z"
                fill="currentColor"
              />
              {/* Middle circle */}
              <circle cx="24" cy="24" r="8" fill="currentColor" />
              {/* New smaller, darker inner circle */}
            </g>
            <defs>
              <clipPath id="clip0_72_930">
                <rect width="48" height="48.2567" fill="currentColor" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}

