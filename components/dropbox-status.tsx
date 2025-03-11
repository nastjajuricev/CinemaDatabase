"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  isDropboxAuthenticated,
  isDropboxKeyConfigured,
  getAuthUrl,
  logoutFromDropbox,
} from "@/lib/dropbox-integration"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Cloud, CloudOff, Loader2, LogIn, LogOut, RefreshCw } from "lucide-react"
import { useFilms } from "@/lib/use-films"

export default function DropboxStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { syncWithDropbox, isDropboxSyncing, dropboxStatus } = useFilms()

  // Check Dropbox status on component mount
  useEffect(() => {
    const checkStatus = () => {
      setIsConfigured(isDropboxKeyConfigured())
      setIsAuthenticated(isDropboxAuthenticated())
    }

    checkStatus()

    // Re-check status every 30 seconds in case it changes in another tab
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleConnect = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuration Error",
        description: "Dropbox API key is not configured.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get the auth URL and redirect to it
      const authUrl = await getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Error connecting to Dropbox:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to Dropbox. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsLoading(true)

    try {
      logoutFromDropbox()
      setIsAuthenticated(false)

      toast({
        title: "Disconnected",
        description: "Your Dropbox account has been disconnected.",
      })
    } catch (error) {
      console.error("Error disconnecting from Dropbox:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect from Dropbox.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Not Connected",
        description: "Please connect to Dropbox first.",
        variant: "destructive",
      })
      return
    }

    const success = await syncWithDropbox()

    if (success) {
      toast({
        title: "Sync Complete",
        description: "Your film database has been synced with Dropbox.",
      })
    } else {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Dropbox. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isConfigured) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Dropbox integration is not configured. Please add the NEXT_PUBLIC_DROPBOX_APP_KEY environment variable.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isAuthenticated ? (
            <Cloud className="h-5 w-5 text-blue-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-500" />
          )}
          Dropbox Integration
        </CardTitle>
        <CardDescription>Connect your Dropbox account to sync and backup your film collection</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Connected to Dropbox
            </div>
            <p className="text-sm text-muted-foreground">Your film collection will sync with Dropbox automatically.</p>

            {dropboxStatus === "syncing" && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing with Dropbox...
              </div>
            )}

            {dropboxStatus === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2">
                <AlertCircle className="h-4 w-4" />
                Last sync encountered an error
              </div>
            )}

            {dropboxStatus === "success" && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                <CheckCircle className="h-4 w-4" />
                Last sync completed successfully
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm">
            Connect your Dropbox account to enable automatic backup and synchronization of your film collection across
            devices.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAuthenticated ? (
          <>
            <Button variant="outline" onClick={handleDisconnect} disabled={isLoading || isDropboxSyncing}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
              Disconnect
            </Button>
            <Button onClick={handleSync} disabled={isLoading || isDropboxSyncing}>
              {isDropboxSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            Connect Dropbox
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

