"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleOAuthCallback, isDropboxKeyConfigured } from "@/lib/dropbox-integration"
import { AlertCircle } from "lucide-react"

export default function DropboxCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing-key">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const processAuth = async () => {
      // First check if Dropbox key is configured
      if (!isDropboxKeyConfigured()) {
        setStatus("missing-key")
        setErrorMessage("Dropbox API key is not configured")
        return
      }

      const code = searchParams.get("code")

      if (!code) {
        setStatus("error")
        setErrorMessage("No authorization code received from Dropbox")
        return
      }

      try {
        const success = await handleOAuthCallback(code)
        if (success) {
          setStatus("success")
          // Redirect after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setErrorMessage("Failed to authenticate with Dropbox")
        }
      } catch (error) {
        console.error("Error during Dropbox authentication:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      }
    }

    processAuth()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {status === "loading" && "Connecting to Dropbox..."}
          {status === "success" && "Successfully connected to Dropbox!"}
          {status === "error" && "Error connecting to Dropbox"}
          {status === "missing-key" && "Dropbox Configuration Error"}
        </h1>

        <div className="text-center">
          {status === "loading" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          )}

          {status === "success" && (
            <div className="text-green-600 dark:text-green-400 mb-4">
              <p>Your film database will now be synced with Dropbox.</p>
              <p className="mt-2">Redirecting to dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600 dark:text-red-400 mb-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12" />
              </div>
              <p>There was a problem connecting to Dropbox.</p>
              {errorMessage && <p className="mt-2 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded">{errorMessage}</p>}
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Settings
              </button>
            </div>
          )}

          {status === "missing-key" && (
            <div className="text-yellow-600 dark:text-yellow-400 mb-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12" />
              </div>
              <p>Dropbox API key is not configured.</p>
              <p className="mt-2 text-sm">
                Please add the{" "}
                <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">
                  NEXT_PUBLIC_DROPBOX_APP_KEY
                </code>{" "}
                environment variable.
              </p>
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

