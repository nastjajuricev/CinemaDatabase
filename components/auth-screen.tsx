"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "@/app/providers"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import LoadingAnimation from "@/components/loading-animation"
// import { Home } from 'lucide-react'

export default function AuthScreen() {
  // Add a new state variable for the repeated password
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, user } = useFilmDatabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoLoginOccurred, setAutoLoginOccurred] = useState(false)
  const [incorrectPassword, setIncorrectPassword] = useState(false)
  const [shakeForm, setShakeForm] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    // Short delay to prevent flash of login screen
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (user.isLoggedIn) {
        // Check if this was an auto-login from remembered credentials
        const remembered = localStorage.getItem("filmDbRememberMe") === "true"
        if (remembered) {
          setAutoLoginOccurred(true)
          // Show auto-login message briefly before redirecting
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          router.push("/dashboard")
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [user, router])

  // Update the handleSubmit function to check if passwords match
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmitting) return

    // Check if passwords match when signing up
    if (isSignUp && password !== repeatPassword) {
      setPasswordsMatch(false)
      return
    }

    // For demo purposes, simulate password validation
    // In a real app, this would be handled by your authentication system
    if (!isSignUp && name && password !== name) {
      // Simulate incorrect password (for demo, we're just checking if password matches username)
      setIncorrectPassword(true)
      setShakeForm(true)

      // Reset shake animation after it completes
      setTimeout(() => {
        setShakeForm(false)
      }, 600) // Match the duration of the shake animation

      return
    }

    setIncorrectPassword(false)
    setIsSubmitting(true)
    login(name, password, rememberMe)

    // Use setTimeout to ensure the login state has time to update
    setTimeout(() => {
      router.push("/dashboard")
      // Reset submission state after navigation (though this won't execute after navigation)
      setIsSubmitting(false)
    }, 100)
  }

  // Add an effect to reset the passwordsMatch state when the password or repeatPassword changes
  useEffect(() => {
    if (isSignUp) {
      setPasswordsMatch(password === repeatPassword || repeatPassword === "")
    }
  }, [password, repeatPassword, isSignUp])

  // Reset incorrect password state when user changes input
  useEffect(() => {
    if (incorrectPassword) {
      setIncorrectPassword(false)
    }
  }, [password, name])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation />
      </div>
    )
  }

  if (user.isLoggedIn) {
    return null // Will redirect in useEffect
  }

  // Update the form to include the repeat password field and change the success message
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
        <div className="text-center mt-2">
          <div className="flex justify-center mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 48 49"
              className="text-black dark:text-white animate-pulse hover:scale-110 hover:text-red-600 transition-all duration-300 mt-8"
              fill="currentColor"
              style={{
                animation: "pulse 3s infinite ease-in-out, spin 15s infinite linear",
                transformOrigin: "center",
                transition: "color 0.3s ease, filter 0.3s ease",
                filter: "drop-shadow(0 0 5px rgba(255, 0, 0, 0.3))",
              }}
              onMouseOver={(e) => (e.currentTarget.style.filter = "drop-shadow(0 0 15px rgba(255, 0, 0, 0.8))")}
              onMouseOut={(e) => (e.currentTarget.style.filter = "drop-shadow(0 0 5px rgba(255, 0, 0, 0.3))")}
            >
              <g clipPath="url(#clip0_72_930)">
                <path d="M42.7061 32.4708C43.6428 30.283 44.2005 27.9578 44.4237 25.5826L47.9136 25.7818C48.034 25.8654 47.9968 26.2751 47.9872 26.427C47.9295 27.3595 47.6759 28.5871 47.4691 29.5105C47.1382 30.9872 46.65 32.4558 46.025 33.8334L42.7061 32.4708Z" />
                <path d="M15.8067 42.8872L14.4077 46.2458C12.4832 45.4115 10.5151 44.2939 8.89336 42.9576C8.73154 42.8244 8.12793 42.3575 8.12793 42.1993C8.12793 42.0228 10.1715 39.845 10.4919 39.5945C12.1319 40.8816 13.8391 42.1415 15.8072 42.8872H15.8067Z" />
                <path d="M5.08753 16.1433C4.32665 18.1539 3.75986 20.2317 3.56759 22.3841L0 21.989C0.195902 19.5374 0.774062 17.0981 1.76357 14.8494L5.08753 16.1438V16.1433Z" />
                <path d="M37.3311 8.44224C37.1329 8.55727 36.1698 7.67658 35.9284 7.5079C34.6198 6.59357 33.239 5.81792 31.7754 5.1732L33.1085 1.89417C34.9085 2.53979 36.7084 3.5696 38.2497 4.70581C38.4315 4.83993 39.4083 5.5583 39.4683 5.6506C39.5237 5.73653 39.5242 5.80791 39.4669 5.89157L37.3315 8.44224H37.3311Z" />
                <path d="M44.5369 11.5062C45.7359 13.6313 46.7836 15.8619 47.3354 18.2534L47.0463 18.4399L43.8769 19.1882C43.3001 17.1491 42.5083 15.1963 41.4238 13.374L41.5056 13.2189L44.1669 11.5571L44.5369 11.5062Z" />
                <path d="M28.3761 44.162L29.0897 47.6729C26.6848 48.2067 24.1399 48.4413 21.6909 48.0885L22.0514 44.5953C23.2804 44.5689 24.4585 44.6648 25.6976 44.5598C26.6003 44.483 27.4843 44.307 28.3761 44.162Z" />
                <path d="M39.2359 37.8445C39.5904 38.0509 41.9308 40.0887 41.8999 40.2669C40.2299 42.1015 38.2914 43.6533 36.1828 44.9532L34.3179 41.8783C36.1051 40.7121 37.7691 39.3985 39.2359 37.8445Z" />
                <path d="M8.59777 10.6842L8.21369 10.5714L5.73242 8.41356C7.37372 6.52625 9.27092 4.82535 11.4536 3.58093L13.318 6.57262C12.3599 7.34828 11.2931 7.98936 10.37 8.8123C9.75727 9.35881 9.10684 10.0535 8.59777 10.6832V10.6842Z" />
                <path d="M0.532715 29.5163L3.97122 28.7416C4.58483 30.7412 5.19936 32.7694 6.35931 34.5285L6.33613 34.634L3.24579 36.4395C2.01857 34.2862 0.968607 31.9747 0.532715 29.5163Z" />
                <path d="M19.1758 4.21111L18.3745 0.688829C19.7254 0.416485 21.1153 0.124591 22.4975 0.0482075C23.2943 0.00410511 24.6065 -0.033632 25.3779 0.0477529C25.5479 0.0654848 25.722 0.101858 25.8642 0.202793C25.7074 1.34946 25.7774 2.58432 25.5033 3.69552C24.6665 3.67415 23.8175 3.60641 22.978 3.65097C21.7021 3.71871 20.4263 3.98151 19.1758 4.21111Z" />
                <path d="M23.8967 6.38672C14.0607 6.38672 6.0874 14.3624 6.0874 24.2014C6.0874 34.0403 14.0607 42.016 23.8967 42.016C33.7327 42.016 41.7061 34.0403 41.7061 24.2014C41.7061 14.3624 33.7327 6.38672 23.8967 6.38672Z" />
                <circle cx="24" cy="24" r="8" />
              </g>
              <defs>
                <clipPath id="clip0_72_930">
                  <rect width="48" height="48.2567" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          {isSignUp && <p className="mt-4 text-gray-600 dark:text-gray-400 font-bold text-xl">Join the club</p>}
        </div>

        <form onSubmit={handleSubmit} className={`mt-8 space-y-6 ${shakeForm ? "shake-animation" : ""}`}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-white dark:bg-gray-800 text-black dark:text-white"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-black dark:text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 bg-white dark:bg-gray-800 text-black dark:text-white ${
                  incorrectPassword ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Your password"
                disabled={isSubmitting}
              />
              {incorrectPassword && <p className="text-red-500 text-sm mt-1">Not this time.</p>}
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="repeat-password" className="text-black dark:text-white">
                  Repeat Password
                </Label>
                <Input
                  id="repeat-password"
                  name="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className={`mt-1 bg-white dark:bg-gray-800 text-black dark:text-white ${
                    !passwordsMatch ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                {!passwordsMatch && <p className="text-red-500 text-sm mt-1">Not today</p>}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isSubmitting}
                  className="border-black dark:border-white"
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-black dark:text-white cursor-pointer">
                  Remember me for easy login
                </Label>
              </div>
            )}
            {!isSignUp && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                Your login information will be saved on this device
              </p>
            )}
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  {isSignUp ? "Signing up..." : "Signing in..."}
                </div>
              ) : isSignUp ? (
                "Sign up"
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setPassword("")
              setRepeatPassword("")
              setPasswordsMatch(true)
              setIncorrectPassword(false)
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={isSubmitting}
          >
            {isSignUp ? "Already have an account? Sign in" : "Join the club?"}
          </button>
        </div>
      </div>
      {autoLoginOccurred && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <div className="text-lime-green mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">Dive in!</h3>
            <p className="text-gray-600 dark:text-gray-300">Automatically signed in from saved preferences</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

