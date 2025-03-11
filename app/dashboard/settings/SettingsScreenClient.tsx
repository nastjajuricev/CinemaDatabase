"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useFilmDatabase } from "@/app/providers"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import {
  getAuthUrl,
  isDropboxAuthenticated,
  logoutFromDropbox,
  isDropboxKeyConfigured,
} from "@/lib/dropbox-integration"
import { AlertCircle } from "lucide-react"
import ExportDatabase from "@/components/export-database"
import { useFilms } from "@/lib/use-films"

export default function SettingsScreenClient() {
  const { user, logout } = useFilmDatabase()
  const router = useRouter()
  const [isDropboxConnected, setIsDropboxConnected] = useState(false)
  const [showKeyWarning, setShowKeyWarning] = useState(false)
  const { films } = useFilms()

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push("/")
    }

    // Check if connected to Dropbox
    setIsDropboxConnected(isDropboxAuthenticated())

    // Check if Dropbox key is configured
    setShowKeyWarning(!isDropboxKeyConfigured())
  }, [user, router])

  const handleConnectDropbox = async () => {
    try {
      if (!isDropboxKeyConfigured()) {
        alert(
          "Dropbox API key is not configured. Please add the NEXT_PUBLIC_DROPBOX_APP_KEY environment variable in your project settings.",
        )
        return
      }

      const authUrl = await getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Error connecting to Dropbox:", error)
      alert("Failed to connect to Dropbox. Please make sure the Dropbox API key is correctly configured.")
    }
  }

  const handleDisconnectDropbox = () => {
    logoutFromDropbox()
    setIsDropboxConnected(false)
  }

  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  if (!user.isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {showKeyWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dropbox API Key Missing</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    The Dropbox integration requires an API key. Please add the{" "}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">
                      NEXT_PUBLIC_DROPBOX_APP_KEY
                    </code>{" "}
                    environment variable to enable Dropbox functionality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                <p className="font-medium">{user.name}</p>
              </div>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Storage</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dropbox Integration</p>
                <p className="font-medium">{isDropboxConnected ? "Connected" : "Not connected"}</p>
              </div>

              {isDropboxConnected ? (
                <Button variant="outline" className="w-full" onClick={handleDisconnectDropbox}>
                  Disconnect from Dropbox
                </Button>
              ) : (
                <Button className="w-full" onClick={handleConnectDropbox} disabled={showKeyWarning}>
                  Connect to Dropbox
                </Button>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connecting to Dropbox allows you to store your film database in the cloud and access it from any device.
              </p>

              {showKeyWarning && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                  Dropbox connection is disabled until you configure the API key.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Backup & Export</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Export your film database</p>
                <p className="font-medium mb-4">Download a backup of your film collection</p>
              </div>

              <ExportDatabase data={films} />

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                This will download a JSON file containing all your film data that you can use as a backup.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Developer Settings</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Environment Variables</p>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <code className="text-sm">
                    <span className="text-purple-600 dark:text-purple-400">NEXT_PUBLIC_DROPBOX_APP_KEY</span>
                    <span className="text-gray-500 dark:text-gray-400"> = </span>
                    <span className="text-green-600 dark:text-green-400">
                      {isDropboxKeyConfigured() ? "********" : "not set"}
                    </span>
                  </code>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  To set up Dropbox integration, add this environment variable to your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavigationBar active="settings" />
    </div>
  )
}

